#region copyright
// Copyright (c) 2017 OEConnection, LLC
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
#endregion

using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Test.Helpers
{
    public static class RadarTestHelpers
    {
        public static Radar CreateTestRadar(int index, string id)
        {
            return new Radar
            {
                Id = id,
                Name = string.Format("Test Radar {0}", index),
                Description = string.Format("Test Radar {0} Description", index),
                Sized = true,
                Cycles = new List<Cycle>
                {
                    CreateTestCycle(index, 0, true),
                    CreateTestCycle(index, 1, true)
                },
                Quadrants = new List<Quadrant>
                {
                    CreateTestQuadrant(index, 0, true),
                    CreateTestQuadrant(index, 1, true),
                    CreateTestQuadrant(index, 2, true),
                    CreateTestQuadrant(index, 3, true)
                }
            };
        }

        public static Cycle CreateTestCycle(int radarIndex, int cycleIndex, bool includeNewId)
        {
            return new Cycle
            {
                Id = includeNewId ? ObjectId.GenerateNewId().ToString() : null,
                Name = string.Format("R{0}C{1}", radarIndex, cycleIndex),
                FullName = string.Format("Test Radar {0} Cycle {1}", radarIndex, cycleIndex),
                Description = string.Format("Test Radar {0} Cycle {1} Description", radarIndex, cycleIndex),
                Order = cycleIndex,
                Size = 1
            };
        }

        public static Quadrant CreateTestQuadrant(int radarIndex, int quadrantIndex, bool includeNewId)
        {
            return new Quadrant
            {
                Id = includeNewId ? ObjectId.GenerateNewId().ToString() : null,
                Name = string.Format("R{0}Q{1}", radarIndex, quadrantIndex),
                Description = string.Format("Test Radar {0} Quadrant {1} Description", radarIndex, quadrantIndex),
                QuadrantNumber = quadrantIndex
            };
        }

        public static Blip CreateTestBlip(Radar radar, Quadrant quadrant, Cycle cycle, int blipIndex, bool includeNewId)
        {

            if (!int.TryParse(radar.Name.Replace("Test Radar ", ""), out int radarIndex))
                radarIndex = 10;

            if (!int.TryParse(quadrant.Name.Substring(quadrant.Name.IndexOf("Q", StringComparison.Ordinal)), out int quadrantIndex))
                quadrantIndex = 10;

            if (!int.TryParse(cycle.Name.Substring(cycle.Name.IndexOf("C", StringComparison.Ordinal)), out int cycleIndex))
                cycleIndex = 10;

            return new Blip
            {
                Id = includeNewId ? ObjectId.GenerateNewId().ToString() : null,
                Name = $"R{radarIndex}Q{quadrantIndex}C{cycleIndex}B{blipIndex}",
                Description = $"Test Radar {radarIndex} Quadrant {quadrantIndex} Cycle {cycleIndex} Blip {blipIndex} Description",
                Added = new DateTime(),
                CycleId = cycle.Id,
                QuadrantId = quadrant.Id,
                RadarId = radar.Id,
                Size = 1
            };
        }

        public static List<Cycle> CreateDefaultCyclesList()
        {
            return new List<Cycle>
            {
                CreateTestCycle(10, 0, false),
                CreateTestCycle(10, 1, false),
                CreateTestCycle(10, 2, false)
            };
        }

        public static List<Quadrant> CreateDefaultQuadrantsList()
        {
            return new List<Quadrant>
            {
                CreateTestQuadrant(10, 0, false),
                CreateTestQuadrant(10, 1, false),
                CreateTestQuadrant(10, 2, false),
                CreateTestQuadrant(10, 3, false)
            };
        }

        public static List<Radar> CreateTestRadarCollection(string[] radarIds)
        {
            return radarIds.Select((id, index) => CreateTestRadar(index, id)).ToList();
        }

        public static List<Blip> CreateTestBlipCollection(List<Radar> radars, int blipsPerCycle)
        {
            var blips = new List<Blip>();

            if (radars == null)
                return blips;

            foreach (var radar in radars)
            {
                foreach (var radarQuadrant in radar.Quadrants)
                {
                    foreach (var radarCycle in radar.Cycles)
                    {
                        for (var i = 0; i < blipsPerCycle; i++)
                        {
                            blips.Add(CreateTestBlip(radar, radarQuadrant, radarCycle, i, true));
                        }
                    }
                }

            }

            return blips;
        }
    }
}
