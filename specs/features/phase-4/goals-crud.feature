Feature: Goal Management
  As a user
  I want to organize tasks into daily, weekly, monthly, and yearly goals
  So that I can track progress at different time horizons

  Scenario: Create a weekly goal
    Given I am on the goals screen
    When I tap "New Goal"
    And I enter title "Exercise 5 times"
    And I set timeframe to "weekly"
    And I set target count to 5
    And I tap "Save"
    Then the goal "Exercise 5 times" should appear under "This Week"
    And the progress should show "0 / 5"

  Scenario: Link task to goal
    Given I have a goal "Exercise 5 times" (weekly, target 5)
    When I create a task "Morning run" with goal type "weekly"
    And I link it to "Exercise 5 times"
    Then the task should show the goal badge
    And the goal should still show "0 / 5"

  Scenario: Goal progress updates on task completion
    Given I have goal "Exercise 5 times" with 3 linked tasks
    And 1 task is already completed (progress: 1/5)
    When I mark another linked task as "done"
    Then the goal progress should update to "2 / 5"

  Scenario: Goal auto-expires at period end
    Given I have a weekly goal with period ending yesterday
    When the dailyGoalRollup function runs
    Then the goal status should change to "expired"
