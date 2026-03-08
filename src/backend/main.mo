import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  let featuredIds = Map.empty<Text, ()>();
  let qualityLabels = Map.empty<Text, Text>();
  var contactInfo : Text = "";

  // Add a featured content ID
  public shared ({ caller }) func addFeaturedId(imdbId : Text) : async () {
    if (featuredIds.containsKey(imdbId)) { Runtime.trap("ID already featured.") };
    featuredIds.add(imdbId, ());
  };

  // Remove a featured content ID
  public shared ({ caller }) func removeFeaturedId(imdbId : Text) : async () {
    featuredIds.remove(imdbId);
  };

  // Get all featured content IDs
  public query ({ caller }) func getFeaturedIds() : async [Text] {
    featuredIds.keys().toArray();
  };

  // Set quality label for a content ID
  public shared ({ caller }) func setQualityLabel(imdbId : Text, labelText : Text) : async () {
    qualityLabels.add(imdbId, labelText);
  };

  // Get quality label for a specific ID
  public query ({ caller }) func getQualityLabel(imdbId : Text) : async ?Text {
    qualityLabels.get(imdbId);
  };

  // Set contact info
  public shared ({ caller }) func setContactInfo(info : Text) : async () {
    contactInfo := info;
  };

  // Get contact info
  public query ({ caller }) func getContactInfo() : async Text {
    contactInfo;
  };
};
