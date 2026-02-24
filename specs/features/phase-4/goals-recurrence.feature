Feature: Recurring Tasks
  As a user
  I want to set tasks to repeat on a schedule
  So that I don't have to recreate routine tasks

  Scenario: Daily recurring task generates next instance
    Given I have a task "Take vitamins" recurring daily
    When the processRecurrence function runs
    Then a new task "Take vitamins" should be created for today
    And it should have status "todo"

  Scenario: Weekly recurring task on specific days
    Given I have a task "Team standup" recurring weekly on Mon, Wed, Fri
    When today is Wednesday
    And the processRecurrence function runs
    Then a new instance of "Team standup" should be created for today

  Scenario: Recurring task stops at end date
    Given I have a recurring task with end date "2026-02-15"
    When the processRecurrence function runs after the end date
    Then no new instance should be created
