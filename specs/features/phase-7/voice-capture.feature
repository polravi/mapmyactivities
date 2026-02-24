Feature: Voice Task Capture
  As a mobile user
  I want to speak a task and have it automatically created
  So that I can capture ideas hands-free

  Scenario: Basic voice task creation
    Given I am on the task list screen
    When I tap the voice button
    And I say "Remind me to call the dentist tomorrow"
    And I stop speaking for 3 seconds
    Then the transcript "Remind me to call the dentist tomorrow" should appear
    And I should see a confirmation card with:
      | Field    | Value                |
      | Title    | Call the dentist     |
      | Due Date | tomorrow's date      |
      | Priority | medium               |

  Scenario: Voice task with priority detection
    Given I tap the voice button
    When I say "Urgently fix the login bug on the website"
    Then the confirmation card should show priority "high"
    And tags should include "bug"

  Scenario: Voice task with goal type detection
    Given I tap the voice button
    When I say "This year I want to run a marathon"
    Then the confirmation card should show goal type "yearly"

  Scenario: User edits voice-parsed task before saving
    Given I spoke a task and see the confirmation card
    When I change the title from "Call dentist" to "Call Dr. Smith"
    And I change priority from "medium" to "high"
    And I tap "Save"
    Then the task should be saved with my edits
    And voiceSource should be true
    And voiceTranscript should contain the original spoken text

  Scenario: User cancels voice task
    Given I spoke a task and see the confirmation card
    When I tap "Cancel"
    Then no task should be created
    And I should return to the task list
