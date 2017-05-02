using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using MongoDB.Bson;
using Moq;
using System.Linq;
using System.Threading.Tasks;
using TechRadar.Services.Artifacts.Interfaces;
using TechRadar.Services.Artifacts.Models;
using TechRadar.Services.Test.Helpers;

namespace TechRadar.Services.Test.Controllers
{
    [TestClass]
    public class RadarController
    {
        private Mock<IRadarRepository> _repository;
        private Mock<IOptions<AppSettings>> _appSettings;

        private string[] _radarIds;

        [TestInitialize]
        public void InitializeTest()
        {
            _repository = new Mock<IRadarRepository>();
            _appSettings = new Mock<IOptions<AppSettings>>();

            _radarIds = new string[3];
            _radarIds[0] = ObjectId.GenerateNewId().ToString();
            _radarIds[1] = ObjectId.GenerateNewId().ToString();
            _radarIds[2] = ObjectId.GenerateNewId().ToString();

            var appSettings = new AppSettings
            {
                DefaultCycles = RadarTestHelpers.CreateDefaultCyclesList(),
                DefaultQuadrants = RadarTestHelpers.CreateDefaultQuadrantsList()
            };

            _appSettings.Setup(x => x.Value)
                .Returns(appSettings);
        }

        #region Radars
        [TestMethod]
        public async Task GetRadar__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.GetRadarById(null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.Get(null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task GetRadar__OKResponse()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");

            _repository
                .Setup(r => r.GetRadarById(radar.Id))
                .Returns(() => Task.FromResult(radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.Get(radar.Id);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult) result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
        }

        [TestMethod]
        public async Task UpsertRadar__BadRequest()
        {
            _repository
                .Setup(r => r.InsertRadar(null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertRadar(null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadar, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertRadar__InsertNew()
        {
            var newRadarId = ObjectId.GenerateNewId().ToString();
            var radar = RadarTestHelpers.CreateTestRadar(10, newRadarId);
            var inputRadar = new Radar
            {
                Id = null,
                Name = radar.Name,
                Description = radar.Description,
                Group = radar.Group
            };

            _repository
                .Setup(r => r.InsertRadar(inputRadar))
                .Returns(() =>
                {
                    return Task.FromResult(radar);
                });

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertRadar(inputRadar);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.IsTrue(returnedRadar.Cycles.Any(), "Cycle collection not created");
            Assert.IsTrue(returnedRadar.Quadrants.Any(), "Quadrant collection not created");

            Assert.IsFalse(returnedRadar.Cycles.Any(x => string.IsNullOrWhiteSpace(x.Id)), "Cycle Ids not created");
            Assert.IsFalse(returnedRadar.Quadrants.Any(x => string.IsNullOrWhiteSpace(x.Id)), "Quadrant Ids not created");
        }

        [TestMethod]
        public async Task UpsertRadar__UpdateExisting()
        {
            const string newGroupName = "Changed In Test";
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");

            radar.Group = newGroupName;

            _repository
                .Setup(r => r.UpdateRadar(radar))
                .Returns(() => Task.FromResult(radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertRadar(radar);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.AreEqual(returnedRadar.Group, newGroupName, "Changed radar not returned");
        }

        [TestMethod]
        public async Task DeleteRadar__BadRequest()
        {
            _repository
                .Setup(r => r.DeleteRadar(null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.Delete(null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task DeleteRadar__OKResponse()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);

            _repository
                .Setup(r => r.DeleteRadar(_radarIds[1]))
                .Returns(() =>
                {
                    radars.Remove(radar);
                    return Task.FromResult(radar);
                });

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.Delete(_radarIds[1]);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK request");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
        }

        #endregion

        #region Quadrants
        [TestMethod]
        public async Task UpsertQuadrant__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.InsertQuadrantInRadar(null, null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertQuadrant(null, null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertQuadrant__BadRequest_NoQuadrant()
        {
            _repository
                .Setup(r => r.InsertQuadrantInRadar(_radarIds[0], null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertQuadrant(_radarIds[0], null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingQuadrant, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertQuadrant__InsertNew()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");
            var quadrant = RadarTestHelpers.CreateTestQuadrant(1, 10, false);
            var quadrantCount = radar.Quadrants.Count();

            _repository
                .Setup(r => r.InsertQuadrantInRadar(radar.Id, quadrant))
                .Returns(() =>
                {
                    quadrant.Id = ObjectId.GenerateNewId().ToString();
                    var quadrants = radar.Quadrants.ToList();
                    quadrants.Add(quadrant);
                    radar.Quadrants = quadrants;
                    return Task.FromResult(radar);
                });
                

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertQuadrant(radar.Id, quadrant);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.AreEqual(returnedRadar.Quadrants.Count(), quadrantCount + 1, "Quadrant count not increased");
            Assert.IsFalse(returnedRadar.Quadrants.Any(x => string.IsNullOrWhiteSpace(x.Id)), "Quadrant Id not created");
        }

        [TestMethod]
        public async Task UpsertQuadrant__UpdateExisting()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");
            var quadrants = radar.Quadrants.ToList();

            var quadrant = quadrants.FirstOrDefault();
            var quadrantCount = radar.Quadrants.Count();

            const string newQuadrantName = "Changed In Test";
            quadrant.Name = newQuadrantName;

            radar.Quadrants = quadrants;

            _repository
                .Setup(r => r.UpdateQuadrantInRadar(radar.Id, quadrant))
                .Returns(() => Task.FromResult(radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertQuadrant(radar.Id, quadrant);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.AreEqual(returnedRadar.Quadrants.Count(), quadrantCount, "Incorrect quadrant count returned");
            Assert.IsTrue(returnedRadar.Quadrants.Any(x => x.Name == newQuadrantName), "Changed quadant not returned");
        }
        #endregion

        #region Cycles
        [TestMethod]
        public async Task UpsertCycle__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.InsertCycleInRadar(null, null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertCycle(null, null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertCycle__BadRequest_NoCycle()
        {
            _repository
                .Setup(r => r.InsertCycleInRadar(_radarIds[0], null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertCycle(_radarIds[0], null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingCycle, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertCycle__OKResponse_InsertNew()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");
            var cycle = RadarTestHelpers.CreateTestCycle(1, 10, false);
            var cycleCount = radar.Cycles.Count();

            _repository
                .Setup(r => r.InsertCycleInRadar(radar.Id, cycle))
                .Returns(() =>
                {
                    cycle.Id = ObjectId.GenerateNewId().ToString();
                    var cycles = radar.Cycles.ToList();
                    cycles.Add(cycle);
                    radar.Cycles = cycles;
                    return Task.FromResult(radar);
                });


            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertCycle(radar.Id, cycle);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.AreEqual(returnedRadar.Cycles.Count(), cycleCount + 1, "Cycle count not increased");
            Assert.IsFalse(returnedRadar.Cycles.Any(x => string.IsNullOrWhiteSpace(x.Id)), "Cycle Id not created");
        }

        [TestMethod]
        public async Task UpsertCycle__OKResponse_UpdateExisting()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Name == "Test Radar 1");
            var cycles = radar.Cycles.ToList();

            var cycle = cycles.FirstOrDefault();
            var cycleCount = radar.Cycles.Count();

            const string newCycleName = "Changed In Test";
            cycle.Name = newCycleName;

            radar.Cycles = cycles;

            _repository
                .Setup(r => r.UpdateCycleInRadar(radar.Id, cycle))
                .Returns(() => Task.FromResult(radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertCycle(radar.Id, cycle);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(returnedRadar.Id, radar.Id, "Incorrect radar returned");
            Assert.AreEqual(returnedRadar.Cycles.Count(), cycleCount, "Incorrect cycle count returned");
            Assert.IsTrue(returnedRadar.Cycles.Any(x => x.Name == newCycleName), "Changed cycle not returned");
        }

        [TestMethod]
        public async Task DeleteCycle__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.DeleteCycleFromRadar(null, null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteCycle(null, null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task DeleteCycle__BadRequest_NoCycle()
        {
            _repository
                .Setup(r => r.DeleteCycleFromRadar(_radarIds[1], null))
                .Returns(() => Task.FromResult(null as Radar));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteCycle(_radarIds[1], null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingCycleId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task DeleteCycle__OKResponse()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);

            var cycles = radar.Cycles.ToList();
            var cycle = cycles.FirstOrDefault();
            var cycleCount = cycles.Count();
            var cycleToDelete = cycle.Id;

            _repository
                .Setup(r => r.DeleteCycleFromRadar(_radarIds[1], cycleToDelete))
                .Returns(() =>
                {
                    cycles.Remove(cycle);
                    radar.Cycles = cycles;
                    return Task.FromResult(radar);
                });

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteCycle(_radarIds[1], cycleToDelete);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK request");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Radar), "Type value returned was not a Radar");

            var returnedRadar = ((OkObjectResult)result).Value as Radar;
            Assert.IsNotNull(returnedRadar, "Radar returned as null");
            Assert.AreEqual(cycleCount - 1, radar.Cycles.Count(), "Cycle count did not decrement");
            Assert.IsFalse(radar.Cycles.Any(x => x.Id == cycleToDelete), "Deleted cycle id found in list");
        }

        #endregion

        #region Blip
        [TestMethod]
        public async Task GetBlips__BadRequest_NoRadarId()
        {
            _repository
                .Setup(r => r.GetBlipsInRadar(null))
                .Returns(() => Task.FromResult(new List<Blip>() as IEnumerable<Blip>));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.GetBlips(null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task GetBlips__OKResponse()
        {
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var blips = RadarTestHelpers.CreateTestBlipCollection(radars, 5);
            var expectedBlips = blips.FindAll(x => x.RadarId == _radarIds[1]);

            _repository
                .Setup(r => r.GetBlipsInRadar(_radarIds[1]))
                .Returns(() => Task.FromResult(expectedBlips as IEnumerable<Blip>));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.GetBlips(_radarIds[1]);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(List<Blip>), "Type value returned was not a list of blips");

            var returnedBlips = ((OkObjectResult)result).Value as List<Blip>;
            Assert.IsNotNull(returnedBlips, "Blip list returned as null");
            Assert.AreEqual(returnedBlips.Count, expectedBlips.Count(), "Blip list count does match expected");
        }

        [TestMethod]
        public async Task GetBlipsWithQuadrant__BadRequest_NoRadarId()
        {
            _repository
                .Setup(r => r.GetBlipsInRadar(null, 1))
                .Returns(() => Task.FromResult(new List<Blip>() as IEnumerable<Blip>));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.GetBlips(null, 1);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task GetBlipsWithQuadrant__OKResponse()
        {
            const int quadrantNumber = 1;
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var blips = RadarTestHelpers.CreateTestBlipCollection(radars, 5);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);
            var quadrant = radar.Quadrants.FirstOrDefault(q => q.QuadrantNumber == quadrantNumber);
            var expectedBlips = blips.FindAll(x => x.RadarId == _radarIds[1] && x.QuadrantId == quadrant.Id );

            _repository
                .Setup(r => r.GetBlipsInRadar(_radarIds[1], quadrantNumber))
                .Returns(() => Task.FromResult(expectedBlips as IEnumerable<Blip>));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.GetBlips(_radarIds[1], quadrantNumber);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(List<Blip>), "Type value returned was not a list of blips");

            var returnedBlips = ((OkObjectResult)result).Value as List<Blip>;
            Assert.IsNotNull(returnedBlips, "Blip list returned as null");
            Assert.AreEqual(returnedBlips.Count, expectedBlips.Count(), "Blip list count does match expected");
        }

        [TestMethod]
        public async Task UpsertBlip__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.InsertBlip(null, null))
                .Returns(() => Task.FromResult(null as Blip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertBlip(null, null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertBlip__BadRequest_NoCycle()
        {
            _repository
                .Setup(r => r.InsertBlip(_radarIds[0], null))
                .Returns(() => Task.FromResult(null as Blip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertBlip(_radarIds[0], null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingBlip, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task UpsertBlip__OKResponse_InsertNew()
        {
            const int quadrantNumber = 1;
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);
            var quadrant = radar.Quadrants.FirstOrDefault(q => q.QuadrantNumber == quadrantNumber);
            var cycle = radar.Cycles.FirstOrDefault();
            var newBlip = RadarTestHelpers.CreateTestBlip(radar, quadrant, cycle, 50, false);

            _repository
                .Setup(r => r.InsertBlip(radar.Id, newBlip))
                .Returns(() =>
                {
                    newBlip.Id = ObjectId.GenerateNewId().ToString();
                    return Task.FromResult(newBlip);
                });

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertBlip(radar.Id, newBlip);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Blip), "Type value returned was not a Blip");

            var returnedBlip = ((OkObjectResult)result).Value as Blip;
            Assert.IsNotNull(returnedBlip, "Blip returned as null");
            Assert.AreEqual(returnedBlip.Id, newBlip.Id, "Incorrect blip returned");
        }

        [TestMethod]
        public async Task UpsertBlip__OKResponse_UpdateExisting()
        {
            const int quadrantNumber = 1;
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);
            var quadrant = radar.Quadrants.FirstOrDefault(q => q.QuadrantNumber == quadrantNumber);
            var cycle = radar.Cycles.FirstOrDefault();
            var newBlip = RadarTestHelpers.CreateTestBlip(radar, quadrant, cycle, 50, true);

            _repository
                .Setup(r => r.UpdateBlip(radar.Id, newBlip))
                .Returns(() => Task.FromResult(newBlip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);
            var result = await controller.UpsertBlip(radar.Id, newBlip);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK result");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Blip), "Type value returned was not a Blip");

            var returnedBlip = ((OkObjectResult)result).Value as Blip;
            Assert.IsNotNull(returnedBlip, "Blip returned as null");
            Assert.AreEqual(returnedBlip.Id, newBlip.Id, "Incorrect blip returned");
        }

        [TestMethod]
        public async Task DeleteBlip__BadRequest_NoRadar()
        {
            _repository
                .Setup(r => r.DeleteBlipFromRadar(null, null))
                .Returns(() => Task.FromResult(null as Blip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteBlip(null, null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingRadarId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task DeleteBlip__BadRequest_NoCycle()
        {
            _repository
                .Setup(r => r.DeleteBlipFromRadar(_radarIds[1], null))
                .Returns(() => Task.FromResult(null as Blip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteBlip(_radarIds[1], null);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(BadRequestObjectResult), "Type returned was not a bad request");
            Assert.AreEqual(BadRequestMessages.MissingBlipId, ((BadRequestObjectResult)result).Value, "Incorrect return message");
        }

        [TestMethod]
        public async Task DeleteBlip__OKResponse()
        {
            const int quadrantNumber = 1;
            var radars = RadarTestHelpers.CreateTestRadarCollection(_radarIds);
            var radar = radars.FirstOrDefault(x => x.Id == _radarIds[1]);
            var quadrant = radar.Quadrants.FirstOrDefault(q => q.QuadrantNumber == quadrantNumber);
            var cycle = radar.Cycles.FirstOrDefault();
            var newBlip = RadarTestHelpers.CreateTestBlip(radar, quadrant, cycle, 50, true);

            _repository
                .Setup(r => r.DeleteBlipFromRadar(_radarIds[1], newBlip.Id))
                .Returns(() => Task.FromResult(newBlip));

            var controller = new Services.Controllers.RadarController(_repository.Object, _appSettings.Object);

            var result = await controller.DeleteBlip(_radarIds[1], newBlip.Id);

            Assert.IsNotNull(result, "No result returned");
            Assert.IsInstanceOfType(result, typeof(OkObjectResult), "Type returned was not an OK request");
            Assert.IsInstanceOfType(((OkObjectResult)result).Value, typeof(Blip), "Type value returned was not a Blip");
        }


        #endregion

    }
}
