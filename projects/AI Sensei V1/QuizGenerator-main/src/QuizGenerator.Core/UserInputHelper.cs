namespace QuizGenerator.Core
{
    public class UserInputHelper
    {
        private string[] languages;
        public UserInputHelper(string[] supportedLanguages)
        {
            languages = supportedLanguages;
        }
        public string SelectLanguage()
        {
            string selection = "";
            bool isInvalid = true;

            while (isInvalid)
            {
                Console.Clear();
                Console.WriteLine("Select language: ");
                for (int i = 0; i < languages.Length; i++)
                {
                    Console.WriteLine($"{i + 1}. {languages[i]}");
                }
                Console.WriteLine("\n(Enter the full name, e.g., 'Python')");

                selection = Console.ReadLine();

                if (selection != null)
                {
                    foreach (string language in languages)
                    {
                        if (language.Equals(selection, StringComparison.OrdinalIgnoreCase))
                        {
                            isInvalid = false;
                            break;
                        }
                    }
                }

                if (isInvalid)
                {
                    Console.WriteLine("Invalid selection! Press Enter to try again.");
                    Console.ReadLine();
                }
            }
            return selection;
        }
        public string SelectTopic(string[] topics)
        {
            string selection = "";
            bool isInvalid = true;

            while (isInvalid)
            {
                Console.Clear();
                Console.WriteLine("Select topic: "); // Changed prompt

                // Display all the topics
                for (int i = 0; i < topics.Length; i++)
                {
                    Console.WriteLine($"{i + 1}. {topics[i]}");
                }
                Console.WriteLine($"\n(Enter the full name, e.g., '{topics[0]}')");

                selection = Console.ReadLine();

                // Validate the selection
                if (selection != null)
                {
                    foreach (string topic in topics) // Changed variable name
                    {
                        if (topic.Equals(selection, StringComparison.OrdinalIgnoreCase))
                        {
                            isInvalid = false; // Valid! Exit the loop.
                            break;
                        }
                    }
                }

                if (isInvalid)
                {
                    Console.WriteLine("Invalid selection! Press Enter to try again.");
                    Console.ReadLine();
                }
            }
            return selection; // Return the valid topic
        }
        public int SelectDifficulty()
        {
            int difficulty = -1;
            bool isInvalid = true;

            while (isInvalid)
            {
                Console.Clear();
                Console.WriteLine("Please enter your desired difficulty (1-5):");
                string input = ""; 
                input += Console.ReadLine();

                if (int.TryParse(input, out difficulty) && difficulty >= 1 && difficulty <= 5)
                {
                    isInvalid = false;
                }
                else
                {
                    Console.WriteLine("Invalid entry. Must be a number between 1 and 5. Press Enter.");
                    Console.ReadLine();
                }
            }
            return difficulty;
        }

        public string GetValidAnswerChoice()
        {
            string[] validAnswers = { "a", "b", "c", "d" };
            string userAnswer = "";
            bool isValid = false;

            while (!isValid)
            {
                Console.Write("Your Answer (A, B, C, or D): ");
                userAnswer = Console.ReadLine().Trim().ToLower();

                if (userAnswer != null)
                {
                    if (validAnswers.Contains(userAnswer))
                    {
                        isValid = true;
                    }
                    else
                    {
                        Console.WriteLine("Invalid selection! Please enter A, B, C, or D. Press Enter to try again.");
                        Console.ReadLine();
                    }
                }
                else
                {
                    Console.WriteLine("Invalid selection! Please enter A, B, C, or D. Press Enter to try again.");
                    Console.ReadLine();
                }
            }
            return userAnswer;
        }
    }
}
