Feature: Create Task
  As a user
  I want to create tasks with details
  So that I can track my activities

  Scenario: Create a basic task
    Given I am signed in and on the task creation screen
    When I enter title "Buy groceries"
    And I set priority to "high"
    And I set due date to "tomorrow"
    And I tap "Save"
    Then the task "Buy groceries" should appear in my task list
    And the task should have status "todo"
    And the task should have priority "high"

  Scenario: Create task with all fields
    Given I am signed in and on the task creation screen
    When I enter title "Prepare quarterly report"
    And I enter description "Include Q1 sales data and projections"
    And I set priority to "high"
    And I set due date to "2026-03-01"
    And I set goal type to "monthly"
    And I add tags "work, reporting"
    And I tap "Save"
    Then the task should be saved with all provided fields

  Scenario: Reject task without title
    Given I am signed in and on the task creation screen
    When I leave the title empty
    And I tap "Save"
    Then I should see a validation error "Title is required"
    And no task should be created
