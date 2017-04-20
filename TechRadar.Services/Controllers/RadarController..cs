using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TechRadar.Services.Models;
using TechRadar.Services.Repositories;

namespace TechRadar.Services.Controllers
{
    [Route("api/[controller]")]
    public class RadarController : Controller
    {
        private readonly AppSettings _settings;
        private readonly IRadarRepository _radarRepository;

        public RadarController(IRadarRepository repository)
        {
            _radarRepository = repository;
        }

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
            if(string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }

            var radar = await _radarRepository.GetRadarById(id);

            return Ok(radar);
        }

        // GET api/radar/id/blips
        [HttpGet("{id}/blips")]
        public async Task<IActionResult> GetBlips(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
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
                return BadRequest();
            }

            var blips = await _radarRepository.GetBlipsInRadar(id, quadrantNumber);

            return Ok(blips);
        }

        // PUT api/radar
        [HttpPut()]
        public async Task<IActionResult> UpsertRadar([FromBody]Radar radar)
        {
            if (radar == null)
            {
                return BadRequest();
            }

            var results = await _radarRepository.UpsertRadar(radar);

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }

            var results = await _radarRepository.DeleteRadar(id);

            return Ok(results);
        }

        // PUT api/radar/5545454/quadrant
        [HttpPut("{id}/quadrant")]
        public async Task<IActionResult> UpsertQuadrant(string id, [FromBody]Quadrant quadrant)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (quadrant == null)
            {
                return BadRequest();
            }

            var results = await _radarRepository.UpsertQuadrantInRadar(id, quadrant);

            return Ok(results);
        }

        // PUT api/radar/5545454/cycle
        [HttpPut("{id}/cycle")]
        public async Task<IActionResult> UpsertCycle(string id, [FromBody]Cycle cycle)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (cycle == null)
            {
                return BadRequest();
            }

            var results = await _radarRepository.UpsertCycleInRadar(id, cycle);

            return Ok(results);
        }

        // DELETE api/radar/5545454/cycle/CycleId
        [HttpDelete("{id}/cycle/{cycleId}")]
        public async Task<IActionResult> Delete(string id, string cycleId)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (string.IsNullOrWhiteSpace(cycleId))
            {
                return BadRequest();
            }

            var results = await _radarRepository.DeleteCycleFromRadar(id, cycleId);

            return Ok(results);
        }

        // PUT api/radar/5545454/blip
        [HttpPut("{id}/blip")]
        public async Task<IActionResult> UpsertBlip(string id, [FromBody]Blip blip)
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                return BadRequest();
            }
            if (blip == null)
            {
                return BadRequest();
            }

            var results = await _radarRepository.UpsertBlip(id, blip);

            return Ok(results);
        }

        // DELETE api/radar/5
        [HttpDelete("{radarId}/blip/{blipId}")]
        public async Task<IActionResult> DeleteBlip(string radarId, string blipId)
        {
            if (string.IsNullOrWhiteSpace(radarId))
            {
                return BadRequest();
            }

            if (string.IsNullOrWhiteSpace(blipId))
            {
                return BadRequest();
            }

            var result = await _radarRepository.DeleteBlipFromRadar(radarId, blipId);

            return Ok(result);
        }
    }
}