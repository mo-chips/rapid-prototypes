using Moq;
using QuizGenerator.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

// Unit tests for QuizService.
// Verifies correct interaction with the persistence layer
// using mocks, ensuring database operations are triggered
// as expected without relying on a real SQLite instance.

namespace QuizGenerator.Tests
{
    public class QuizServiceTests
    {
        [Fact]
        public void SaveQuizToDataBase_ShouldCallSaveOnHelper()
        {
            var mockDb = new Mock<ISQLiteHelper>();

            QuizService service = new QuizService(null, mockDb.Object);

            string dummyJson = "{\"title\"}: \"test\"}";
            mockDb.Setup(db => db.SaveQuiz(dummyJson)).Returns(55);

            int result = service.SaveQuizToDataBase(dummyJson);
            Assert.Equal(55, result);

            mockDb.Verify(db => db.InitalizeDataBase(), Times.Once);

            mockDb.Verify(db => db.SaveQuiz(dummyJson), Times.Once);
        }
    }
}
