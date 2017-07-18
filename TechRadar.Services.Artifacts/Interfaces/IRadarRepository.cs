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

using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.VisualBasic.CompilerServices;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Artifacts.Interfaces
{
    public interface IRadarRepository
    {
        Task<IEnumerable<Radar>> GetRadars();
        Task<Radar> GetRadarById(string id);
        Task<Radar> InsertRadar(Radar radar);
        Task<Radar> UpdateRadar(Radar radar);
        Task<Radar> DeleteRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id);
        Task<IEnumerable<Blip>> GetBlipsInRadar(string id, int quadrantNumber);
        Task<Radar> InsertQuadrantInRadar(string id, Quadrant quadrant);
        Task<Radar> UpdateQuadrantInRadar(string id, Quadrant quadrant);
        Task<Radar> InsertCycleInRadar(string id, Cycle cycle);
        Task<Radar> UpdateCycleInRadar(string id, Cycle cycle);
        Task<Radar> DeleteCycleFromRadar(string id, string cycleId);
        Task<Blip> InsertBlip(string id, Blip blip);
        Task<Blip> UpdateBlip(string id, Blip blip);
        Task<Blip> DeleteBlipFromRadar(string radarId, string blipId);
    }
}
