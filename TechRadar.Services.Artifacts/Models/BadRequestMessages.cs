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

namespace TechRadar.Services.Artifacts.Models
{
    public static class BadRequestMessages
    {
        public const string MissingRadarId = "A radar id must be provided";
        public const string MissingRadar = "Radar data must be provided";
        public const string MissingCycle = "Cycle data must be provided";
        public const string MissingCycleId = "A cycle id must be provided";
        public const string MissingQuadrant = "Quadrant data must be provided";
        public const string MissingBlip = "Blip data must be provided";
        public const string MissingBlipId = "A blip id must be provided";
    }
}
