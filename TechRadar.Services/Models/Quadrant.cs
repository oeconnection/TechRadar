using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Models
{
    [BsonIgnoreExtraElements]
    public class Quadrant
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("quadrantNumber")]
        public int QuadrantNumber { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }
    }
}
