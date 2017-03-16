using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Models
{
    [BsonIgnoreExtraElements]
    public class Blip
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("added")]
        [BsonDateTimeOptions(DateOnly =true)]
        public DateTime Added { get; set; }

        [BsonElement("size")]
        public int Size { get; set; }

        [BsonElement("radar")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string RadarId { get; set; }

        [BsonElement("quadrant")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string QuadrantId { get; set; }

        [BsonElement("cycle")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string CycleId { get; set; }
    }
}
