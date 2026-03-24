import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type ScriptsState = Map.Map<Nat, Script>;
  type PurchasesState = Map.Map<Nat, Purchase>;
  type ProfileState = Map.Map<Principal, UserProfile>;

  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      switch (Text.compare(user1.username, user2.username)) {
        case (#equal) { Text.compare(user1.email, user2.email) };
        case (order) { order };
      };
    };
  };

  module Script {
    public func compare(s1 : Script, s2 : Script) : Order.Order {
      Text.compare(s1.title, s2.title);
    };
  };

  module Purchase {
    public func compareByBuyer(p1 : Purchase, p2 : Purchase) : Order.Order {
      Text.compare(p1.buyerPrincipal.toText(), p2.buyerPrincipal.toText());
    };
  };

  type Script = {
    id : Nat;
    title : Text;
    description : Text;
    version : Text;
    price : Nat;
    language : Text;
    category : Text;
    requirements : Text;
    changelog : Text;
    fileKey : Text;
    accessKey : ?Text;
    imageKey : Text;
    isActive : Bool;
    createdAt : Time.Time;
  };

  type Purchase = {
    id : Nat;
    buyerPrincipal : Principal;
    scriptId : Nat;
    purchasedAt : Time.Time;
    accessKey : ?Text;
  };

  type UserProfile = {
    userPrincipal : Principal;
    username : Text;
    email : Text;
    isAdmin : Bool;
    isActive : Bool;
    createdAt : Time.Time;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  stable var scripts = Map.empty<Nat, Script>();
  stable var nextScriptId = 0;

  stable var purchases = Map.empty<Nat, Purchase>();
  stable var nextPurchaseId = 0;

  stable var persistentProfileData : ProfileState = Map.empty<Principal, UserProfile>();
  stable var firstUserRegistered = false;

  func getNextScriptId() : Nat {
    let id = nextScriptId;
    nextScriptId += 1;
    id;
  };

  func getNextPurchaseId() : Nat {
    let id = nextPurchaseId;
    nextPurchaseId += 1;
    id;
  };

  func getScriptInternal(id : Nat) : ?Script {
    scripts.get(id);
  };

  func getPurchaseInternal(id : Nat) : ?Purchase {
    purchases.get(id);
  };

  func getUserProfileInternal(principal : Principal) : ?UserProfile {
    persistentProfileData.get(principal);
  };

  // User registration - first user becomes admin
  public shared ({ caller }) func registerUser(username : Text, email : Text) : async Text {
    // Check if user already exists
    switch (persistentProfileData.get(caller)) {
      case (?_) { Runtime.trap("User already registered") };
      case null {};
    };

    let isAdmin = not firstUserRegistered;
    let newProfile : UserProfile = {
      userPrincipal = caller;
      username;
      email;
      isAdmin;
      isActive = true;
      createdAt = Time.now();
    };

    persistentProfileData.add(caller, newProfile);

    if (isAdmin) {
      firstUserRegistered := true;
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    } else {
      AccessControl.assignRole(accessControlState, caller, caller, #user);
    };

    if (isAdmin) {
      "User registered as admin"
    } else {
      "User registered successfully"
    };
  };

  // Get current user's profile
  public query ({ caller }) func getMyProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    persistentProfileData.get(caller);
  };

  // Get caller's profile (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    persistentProfileData.get(caller);
  };

  // Save caller's profile (required by frontend)
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    persistentProfileData.add(caller, profile);
  };

  // Get any user's profile (required by frontend)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    persistentProfileData.get(user);
  };

  // Get all active scripts (public)
  public query func getAllScripts() : async [Script] {
    let allScripts = scripts.values().toArray();
    allScripts.filter<Script>(func(s) { s.isActive });
  };

  // Get script by ID (public)
  public query func getScriptById(id : Nat) : async ?Script {
    getScriptInternal(id);
  };

  // Purchase a script (user only)
  public shared ({ caller }) func purchaseScript(scriptId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can purchase scripts");
    };

    // Verify user is active
    switch (persistentProfileData.get(caller)) {
      case null { Runtime.trap("User profile not found") };
      case (?profile) {
        if (not profile.isActive) {
          Runtime.trap("User account is not active");
        };
      };
    };

    // Verify script exists and is active
    switch (getScriptInternal(scriptId)) {
      case null { Runtime.trap("Script not found") };
      case (?script) {
        if (not script.isActive) {
          Runtime.trap("Script is not active");
        };

        let id = getNextPurchaseId();
        let newPurchase : Purchase = {
          id;
          buyerPrincipal = caller;
          scriptId;
          purchasedAt = Time.now();
          accessKey = script.accessKey;
        };

        purchases.add(id, newPurchase);

        switch (script.accessKey) {
          case (?key) { "Purchase successful. Access key: " # key };
          case null { "Purchase successful. Download info: " # script.fileKey };
        };
      };
    };
  };

  // Get user's purchases (user only)
  public query ({ caller }) func getMyPurchases() : async [Purchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view purchases");
    };

    let allPurchases = purchases.values().toArray();
    allPurchases.filter<Purchase>(func(p) { p.buyerPrincipal == caller });
  };

  // Admin: Create script
  public shared ({ caller }) func adminCreateScript(
    title : Text,
    description : Text,
    version : Text,
    price : Nat,
    language : Text,
    category : Text,
    requirements : Text,
    changelog : Text,
    fileKey : Text,
    accessKey : Text,
    imageKey : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create scripts");
    };

    let id = getNextScriptId();
    let newScript : Script = {
      id;
      title;
      description;
      version;
      price;
      language;
      category;
      requirements;
      changelog;
      fileKey;
      accessKey = if (accessKey == "") { null } else { ?accessKey };
      imageKey;
      isActive = true;
      createdAt = Time.now();
    };

    scripts.add(id, newScript);
    "Script created with ID: " # id.toText();
  };

  // Admin: Update script
  public shared ({ caller }) func adminUpdateScript(
    id : Nat,
    title : Text,
    description : Text,
    version : Text,
    price : Nat,
    language : Text,
    category : Text,
    requirements : Text,
    changelog : Text,
    fileKey : Text,
    accessKey : Text,
    imageKey : Text,
    isActive : Bool,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update scripts");
    };

    switch (getScriptInternal(id)) {
      case null { Runtime.trap("Script not found") };
      case (?script) {
        let updatedScript : Script = {
          id;
          title;
          description;
          version;
          price;
          language;
          category;
          requirements;
          changelog;
          fileKey;
          accessKey = if (accessKey == "") { null } else { ?accessKey };
          imageKey;
          isActive;
          createdAt = script.createdAt;
        };

        scripts.add(id, updatedScript);
        "Script updated successfully";
      };
    };
  };

  // Admin: Delete script
  public shared ({ caller }) func adminDeleteScript(id : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete scripts");
    };

    switch (getScriptInternal(id)) {
      case null { Runtime.trap("Script not found") };
      case (?_) {
        scripts.remove(id);
        "Script deleted successfully";
      };
    };
  };

  // Admin: Get all users
  public query ({ caller }) func adminGetAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };

    persistentProfileData.values().toArray();
  };

  // Admin: Get all purchases
  public query ({ caller }) func adminGetAllPurchases() : async [Purchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all purchases");
    };

    purchases.values().toArray();
  };

  // Admin: Get stats
  public query ({ caller }) func adminGetStats() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view stats");
    };

    let totalUsers = persistentProfileData.size();
    let totalScripts = scripts.size();
    let totalPurchases = purchases.size();
    let activeScripts = scripts.values().toArray().filter(func(s) { s.isActive }).size();

    "{\"totalUsers\": " # totalUsers.toText() #
    ", \"totalScripts\": " # totalScripts.toText() #
    ", \"activeScripts\": " # activeScripts.toText() #
    ", \"totalPurchases\": " # totalPurchases.toText() # "}";
  };

  // Admin: Promote user to admin
  public shared ({ caller }) func promoteToAdmin(targetPrincipal : Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };

    switch (persistentProfileData.get(targetPrincipal)) {
      case null { Runtime.trap("User not found") };
      case (?profile) {
        if (profile.isAdmin) {
          Runtime.trap("User is already an admin");
        };

        let updatedProfile : UserProfile = {
          profile with isAdmin = true;
        };

        persistentProfileData.add(targetPrincipal, updatedProfile);
        AccessControl.assignRole(accessControlState, caller, targetPrincipal, #admin);
        "User promoted to admin successfully";
      };
    };
  };

  // Admin: Toggle user active status
  public shared ({ caller }) func toggleUserStatus(targetPrincipal : Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle user status");
    };

    switch (persistentProfileData.get(targetPrincipal)) {
      case null { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          profile with isActive = not profile.isActive;
        };

        persistentProfileData.add(targetPrincipal, updatedProfile);
        if (updatedProfile.isActive) {
          "User activated successfully"
        } else {
          "User deactivated successfully"
        };
      };
    };
  };

  include MixinStorage();
};
