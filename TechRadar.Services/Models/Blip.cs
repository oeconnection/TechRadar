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
        public ObjectId Id { get; set; }

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
        public ObjectId RadarId { get; set; }

        [BsonElement("quadrant")]
        public ObjectId QuadrantId { get; set; }

        [BsonElement("cycle")]
        public ObjectId CycleId { get; set; }
    }
}
