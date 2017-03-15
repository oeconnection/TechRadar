using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Models
{
    [BsonIgnoreExtraElements]
    public class Cycle
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("fullName")]
        public string FullName { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("order")]
        public int Order { get; set; }

        [BsonElement("size")]
        public int Size { get; set; }

    }
}
