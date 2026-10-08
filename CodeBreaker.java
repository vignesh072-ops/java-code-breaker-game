package CodeBreaker;
import java.util.Random;
import java.util.Scanner;

public class CodeBreaker {

    static Scanner sc = new Scanner(System.in);
    static Random random = new Random();

    static int highScore = 0;

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("       🔐 CODE BREAKER GAME");
        System.out.println("=================================");

        boolean playAgain = true;

        while (playAgain) {

            int score = playGame();

            if (score > highScore) {
                highScore = score;
                System.out.println("🏆 NEW HIGH SCORE: " + highScore);
            }

            System.out.println("\nYour High Score: " + highScore);

            System.out.print("\nPlay again? (yes/no): ");
            String answer = sc.next();

            playAgain = answer.equalsIgnoreCase("yes");
        }

        System.out.println("\n=================================");
        System.out.println("      🔐 GAME OVER");
        System.out.println("      Thanks for playing!");
        System.out.println("=================================");

        sc.close();
    }

    static int playGame() {

        System.out.println("\nChoose Difficulty:");
        System.out.println("1. Easy   → 1 to 50");
        System.out.println("2. Medium → 1 to 100");
        System.out.println("3. Hard   → 1 to 500");

        System.out.print("Enter choice: ");
        int choice = sc.nextInt();

        int maxNumber;
        int lives;

        switch (choice) {

            case 1:
                maxNumber = 50;
                lives = 8;
                break;

            case 2:
                maxNumber = 100;
                lives = 7;
                break;

            case 3:
                maxNumber = 500;
                lives = 6;
                break;

            default:
                System.out.println("Invalid choice! Medium mode selected.");
                maxNumber = 100;
                lives = 7;
        }

        int secretNumber = random.nextInt(maxNumber) + 1;

        int attempts = 0;

        System.out.println("\n🔐 A secret number has been generated!");
        System.out.println("Guess the number between 1 and " + maxNumber);

        while (lives > 0) {

            System.out.println("\n❤️ Lives remaining: " + lives);

            System.out.print("Enter your guess: ");
            int guess = sc.nextInt();

            attempts++;
            lives--;

            if (guess == secretNumber) {

                int score = calculateScore(lives, attempts);

                System.out.println("\n🎉 ACCESS GRANTED!");
                System.out.println("You cracked the code!");
                System.out.println("Secret Number: " + secretNumber);
                System.out.println("Attempts: " + attempts);
                System.out.println("Score: " + score);

                if (attempts == 1) {
                    System.out.println("🔥 PERFECT GUESS!");
                } else if (attempts <= 3) {
                    System.out.println("⚡ Excellent!");
                } else {
                    System.out.println("👍 Good job!");
                }

                return score;
            }

            int difference = Math.abs(secretNumber - guess);

            if (difference <= 5) {
                System.out.println("🔥 VERY HOT!");
            } 
            else if (difference <= 15) {
                System.out.println("🌡️ Warm...");
            } 
            else {
                System.out.println("❄️ Very Cold!");
            }

            if (guess > secretNumber) {
                System.out.println("⬇️ Try a LOWER number.");
            } 
            else {
                System.out.println("⬆️ Try a HIGHER number.");
            }
        }

        System.out.println("\n💀 ACCESS DENIED!");
        System.out.println("The secret number was: " + secretNumber);

        return 0;
    }

    static int calculateScore(int lives, int attempts) {

        int score = 100;

        score += lives * 20;
        score -= attempts * 5;

        if (score < 0) {
            score = 0;
        }

        return score;
    }
}
