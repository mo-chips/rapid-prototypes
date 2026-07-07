using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizGenerator.Core;
using System.Runtime.InteropServices;
using System.Text.Json;
using QuizGenerator.API.Models;


// HTTP API controller for quiz operations.
// Exposes endpoints for quiz generation, persistence,
// retrieval, update, and deletion while keeping all
// business logic delegated to the QuizService.


namespace QuizGenerator.API.Controllers
{
    // Controller address 
    [Route("api/[controller]")]
    // Controller rules
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly QuizService _quizService;
        public QuizController(QuizService quizService)
        {
            _quizService = quizService;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateQuiz([FromBody] GenerateQuizRequest request)
        {
            try
            {
                string quizJSON = await _quizService.GenerateQuiz(request.Language, request.Difficulty, request.Topic);
                if (string.IsNullOrEmpty(quizJSON))
                    return StatusCode(500, "Failed to generate quiz");

                var jsonElement = JsonSerializer.Deserialize<JsonElement>(quizJSON);
                return Ok(jsonElement);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", detail = ex.Message });
            }
        }

        [HttpPost("save")]
        public IActionResult SaveQuiz([FromBody] JsonElement quizData)
        {
            try
            {
                string quizString = quizData.ToString();
                int newId = _quizService.SaveQuizToDataBase(quizString);
                return Ok(new { status = "Success", id = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetQuiz(int id)
        {
            try
            {
                string json = _quizService.GetQuizFromDataBase(id);
                if (string.IsNullOrEmpty(json))
                    return NotFound("Quiz not found");

                var obj = JsonSerializer.Deserialize<JsonElement>(json);
                return Ok(obj);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", detail = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteQuiz(int id)
        {
            try
            {
                string json = _quizService.GetQuizFromDataBase(id);
                if (string.IsNullOrEmpty(json))
                    return NotFound("Quiz not found");

                _quizService.DeleteQuizFromDataBase(id);
                return Ok("Success");
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", detail = ex.Message });
            }
        }

        [HttpGet("GetAll")]
        public IActionResult GetAllQuizzes()
        {
            try
            {
                var jsonlist = _quizService.GetAllQuizzesFromDataBase();
                return Ok(jsonlist);
            }
            catch(Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error", detail = ex.Message });
            }
        }

        [HttpPut("{id}")] 
        public IActionResult UpdateQuiz(int id, [FromBody] JsonElement newQuizData)
        {
            try
            {
                string jsonString = newQuizData.ToString();
                _quizService.UpdateQuizInDatabase(id, jsonString);
                return Ok(new { status = "Updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
