using System.ComponentModel.DataAnnotations;

// API request DTO for quiz generation.
// Defines and validates the minimal input required by clients
// to generate a quiz, enforcing basic constraints at the API boundary.


namespace QuizGenerator.API.Models
{
    public class GenerateQuizRequest
    {
        [Required]
        public string Topic { get; set; }
        [Range(1,5)]
        public int Difficulty { get; set; }
        [Required]
        public string Language { get; set; }
    }
}
