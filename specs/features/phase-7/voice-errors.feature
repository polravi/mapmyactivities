Feature: Voice Error Handling
  As a mobile user
  I want clear feedback when voice capture fails
  So that I can fall back to manual entry

  Scenario: Microphone permission denied
    Given I have not granted microphone permission
    When I tap the voice button
    Then I should see "Microphone access required"
    And a link to open device settings

  Scenario: Speech not recognized
    Given I tap the voice button
    And I make unintelligible sounds
    When the STT returns empty text
    Then I should see "Could not understand speech. Try again?"
    And options to "Try Again" or "Type manually"

  Scenario: AI parsing fails
    Given I speak a valid sentence
    But the Claude API returns an error
    Then I should see the raw transcript
    And a manual task creation form pre-filled with the transcript as title
