import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  type ScriptsState = Map.Map<Nat, Script>;
  type PurchasesState = Map.Map<Nat, Purchase>;
  type ProfileState = Map.Map<Principal, UserProfile>;

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

  system func postupgrade() {
    for ((principal, profile) in persistentProfileData.entries()) {
      if (profile.isAdmin) {
        accessControlState.userRoles.add(principal, #admin);
        accessControlState.adminAssigned := true;
      } else {
        accessControlState.userRoles.add(principal, #user);
      };
    };
  };

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

  public shared ({ caller }) func registerUser(username : Text, email : Text) : async Text {
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
      accessControlState.userRoles.add(caller, #admin);
      accessControlState.adminAssigned := true;
    } else {
      accessControlState.userRoles.add(caller, #user);
    };
    if (isAdmin) { "User registered as admin" } else { "User registered successfully" };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    persistentProfileData.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    persistentProfileData.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    persistentProfileData.get(user);
  };

  public query func getAllScripts() : async [Script] {
    scripts.values().toArray().filter<Script>(func(s) { s.isActive });
  };

  public query func getScriptById(id : Nat) : async ?Script {
    getScriptInternal(id);
  };

  public shared ({ caller }) func purchaseScript(scriptId : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    switch (persistentProfileData.get(caller)) {
      case null { Runtime.trap("User profile not found") };
      case (?profile) {
        if (not profile.isActive) { Runtime.trap("User account is not active") };
      };
    };
    switch (getScriptInternal(scriptId)) {
      case null { Runtime.trap("Script not found") };
      case (?script) {
        if (not script.isActive) { Runtime.trap("Script is not active") };
        let id = getNextPurchaseId();
        purchases.add(id, {
          id;
          buyerPrincipal = caller;
          scriptId;
          purchasedAt = Time.now();
          accessKey = script.accessKey;
        });
        switch (script.accessKey) {
          case (?key) { "Purchase successful. Access key: " # key };
          case null { "Purchase successful. Download info: " # script.fileKey };
        };
      };
    };
  };

  public query ({ caller }) func getMyPurchases() : async [Purchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    purchases.values().toArray().filter<Purchase>(func(p) { p.buyerPrincipal == caller });
  };

  public shared ({ caller }) func adminCreateScript(
    title : Text, description : Text, version : Text, price : Nat,
    language : Text, category : Text, requirements : Text, changelog : Text,
    fileKey : Text, accessKey : Text, imageKey : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    let id = getNextScriptId();
    scripts.add(id, {
      id; title; description; version; price; language; category;
      requirements; changelog; fileKey;
      accessKey = if (accessKey == "") { null } else { ?accessKey };
      imageKey; isActive = true; createdAt = Time.now();
    });
    "Script created with ID: " # id.toText();
  };

  public shared ({ caller }) func adminUpdateScript(
    id : Nat, title : Text, description : Text, version : Text, price : Nat,
    language : Text, category : Text, requirements : Text, changelog : Text,
    fileKey : Text, accessKey : Text, imageKey : Text, isActive : Bool,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (getScriptInternal(id)) {
      case null { Runtime.trap("Script not found") };
      case (?script) {
        scripts.add(id, {
          id; title; description; version; price; language; category;
          requirements; changelog; fileKey;
          accessKey = if (accessKey == "") { null } else { ?accessKey };
          imageKey; isActive; createdAt = script.createdAt;
        });
        "Script updated successfully";
      };
    };
  };

  public shared ({ caller }) func adminDeleteScript(id : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (getScriptInternal(id)) {
      case null { Runtime.trap("Script not found") };
      case (?_) { scripts.remove(id); "Script deleted successfully" };
    };
  };

  public query ({ caller }) func adminGetAllUsers() : async [UserProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    persistentProfileData.values().toArray();
  };

  public query ({ caller }) func adminGetAllPurchases() : async [Purchase] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    purchases.values().toArray();
  };

  public query ({ caller }) func adminGetStats() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
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

  public shared ({ caller }) func promoteToAdmin(targetPrincipal : Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (persistentProfileData.get(targetPrincipal)) {
      case null { Runtime.trap("User not found") };
      case (?profile) {
        if (profile.isAdmin) { Runtime.trap("User is already an admin") };
        persistentProfileData.add(targetPrincipal, { profile with isAdmin = true });
        accessControlState.userRoles.add(targetPrincipal, #admin);
        "User promoted to admin successfully";
      };
    };
  };

  public shared ({ caller }) func toggleUserStatus(targetPrincipal : Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized");
    };
    switch (persistentProfileData.get(targetPrincipal)) {
      case null { Runtime.trap("User not found") };
      case (?profile) {
        let updatedProfile = { profile with isActive = not profile.isActive };
        persistentProfileData.add(targetPrincipal, updatedProfile);
        if (updatedProfile.isActive) { "User activated" } else { "User deactivated" };
      };
    };
  };

  include MixinStorage();
};
