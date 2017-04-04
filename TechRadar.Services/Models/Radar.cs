using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace TechRadar.Services.Models
{
    [BsonIgnoreExtraElements]
    public class Radar
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("group")]
        public string Group { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("quadrants")]
        public IEnumerable<Quadrant> Quadrants { get; set; }

        [BsonElement("cycles")]
        public IEnumerable<Cycle> Cycles { get; set; }
    }
}
