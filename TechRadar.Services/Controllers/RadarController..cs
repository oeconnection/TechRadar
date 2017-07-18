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

using System.Linq;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using TechRadar.Services.Artifacts.Interfaces;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class RadarController : Controller
    {
        private readonly IRadarRepository _radarRepository;
        private readonly AppSettings _appSettings;

        public RadarController(IRadarRepository repository, IOptions<AppSettings> appSettings)
        {
            _appSettings = appSettings.Value;
            _radarRepository = repository;
        }

        #region Radar
        // GET: api/radar
        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var radarList = await _radarRepository.GetRadars();

            return Ok(radarList);
        }

        // GET api/radar/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }

            var radar = await _radarRepository.GetRadarById(id);

            return Ok(radar);
        }

        // PUT api/radar
        [HttpPut()]
        public async Task<IActionResult> UpsertRadar([FromBody]Radar radar)
        {
            if (radar == null)
            {
                return BadRequest(BadRequestMessages.MissingRadar);
            }

            Radar results;
            if (string.IsNullOrWhiteSpace(radar.Id))
            {
                if (radar.Quadrants == null || !radar.Quadrants.Any())
                {
                    radar.Quadrants = _appSettings.DefaultQuadrants;
                }
                if (radar.Cycles == null || !radar.Cycles.Any())
                {
                    radar.Cycles = _appSettings.DefaultCycles;
                }
                results = await _radarRepository.InsertRadar(radar);
            }
            else
            {
                results = await _radarRepository.UpdateRadar(radar);
            }

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }

            var results = await _radarRepository.DeleteRadar(id);

            return Ok(results);
        }

        #endregion

        #region Quadrant
        // PUT api/radar/5545454/quadrant
        [HttpPut("{id}/quadrant")]
        public async Task<IActionResult> UpsertQuadrant(string id, [FromBody]Quadrant quadrant)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }
            if (quadrant == null)
            {
                return BadRequest(BadRequestMessages.MissingQuadrant);
            }

            Radar results;
            if (string.IsNullOrWhiteSpace(quadrant.Id))
            {
                results = await _radarRepository.InsertQuadrantInRadar(id, quadrant);
            }
            else
            {
                results = await _radarRepository.UpdateQuadrantInRadar(id, quadrant);
            }

            return Ok(results);
        }

        #endregion

        #region Cycle
        // PUT api/radar/5545454/cycle
        [HttpPut("{id}/cycle")]
        public async Task<IActionResult> UpsertCycle(string id, [FromBody]Cycle cycle)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }
            if (cycle == null)
            {
                return BadRequest(BadRequestMessages.MissingCycle);
            }

            Radar results;
            if (string.IsNullOrWhiteSpace(cycle.Id))
            {
                results = await _radarRepository.InsertCycleInRadar(id, cycle);
            }
            else
            {
                results = await _radarRepository.UpdateCycleInRadar(id, cycle);
            }


            return Ok(results);
        }

        // DELETE api/radar/5545454/cycle/CycleId
        [HttpDelete("{id}/cycle/{cycleId}")]
        public async Task<IActionResult> DeleteCycle(string id, string cycleId)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }
            if (string.IsNullOrWhiteSpace(cycleId))
            {
                return BadRequest(BadRequestMessages.MissingCycleId);
            }

            var results = await _radarRepository.DeleteCycleFromRadar(id, cycleId);

            return Ok(results);
        }

        #endregion

        #region Blip
        // GET api/radar/id/blips
        [HttpGet("{id}/blips")]
        public async Task<IActionResult> GetBlips(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }

            var blips = await _radarRepository.GetBlipsInRadar(id);

            return Ok(blips);
        }

        // GET api/radar/id/blips/3
        [HttpGet("{id}/blips/{quadrantNumber}")]
        public async Task<IActionResult> GetBlips(string id, int quadrantNumber)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }

            var blips = await _radarRepository.GetBlipsInRadar(id, quadrantNumber);

            return Ok(blips);
        }

        // PUT api/radar/5545454/blip
        [HttpPut("{id}/blip")]
        public async Task<IActionResult> UpsertBlip(string id, [FromBody]Blip blip)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }
            if (blip == null)
            {
                return BadRequest(BadRequestMessages.MissingBlip);
            }

            Blip results;
            if (string.IsNullOrWhiteSpace(blip.Id))
            {
                results = await _radarRepository.InsertBlip(id, blip);
            }
            else
            {
                results = await _radarRepository.UpdateBlip(id, blip);
            }

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{radarId}/blip/{blipId}")]
        public async Task<IActionResult> DeleteBlip(string radarId, string blipId)
        {
            if (string.IsNullOrWhiteSpace(radarId))
            {
                return BadRequest(BadRequestMessages.MissingRadarId);
            }

            if (string.IsNullOrWhiteSpace(blipId))
            {
                return BadRequest(BadRequestMessages.MissingBlipId);
            }

            var result = await _radarRepository.DeleteBlipFromRadar(radarId, blipId);

            return Ok(result);
        }

        #endregion

    }
}