Feature: Conflict Resolution
  As a user editing on multiple devices
  I want conflicts to be resolved intelligently
  So that I never lose important changes

  Scenario: Last-write-wins on same field
    Given I have a task "Buy groceries" on both platforms
    When I change description to "From Trader Joes" on mobile at 10:00
    And I change description to "From Whole Foods" on web at 10:01
    And mobile syncs at 10:02
    Then the description should be "From Whole Foods" on both platforms

  Scenario: Field-level merge on different fields
    Given I have a task "Buy groceries" on both platforms
    When I change priority to "high" on mobile
    And I change description to "Organic only" on web
    And mobile syncs
    Then the task should have priority "high" AND description "Organic only"

  Scenario: Eisenhower quadrant uses client-wins
    Given I have a task in Q1 on the server
    When I manually move the task to Q2 on mobile
    And mobile syncs
    Then the task should be in Q2 on both platforms

  Scenario: Task status never regresses
    Given I have a task with status "done" on web
    When mobile syncs an older change with status "in_progress"
    Then the task should remain "done" on both platforms

  Scenario: Offline changes sync after reconnect
    Given I create 3 tasks while offline on mobile
    And I edit 2 existing tasks while offline
    When my device reconnects to the internet
    Then all 5 changes should sync to Firestore within 10 seconds
    And no data should be lost
