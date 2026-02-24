Feature: View and Manage Tasks
  As a user
  I want to see, edit, and delete my tasks
  So that I can manage my activities

  Scenario: View task list
    Given I have 5 tasks in my account
    When I navigate to the task list
    Then I should see all 5 tasks displayed
    And each task should show title, priority badge, and due date

  Scenario: Edit a task
    Given I have a task "Buy groceries" with priority "low"
    When I open the task detail for "Buy groceries"
    And I change the priority to "high"
    And I tap "Save"
    Then the task should show priority "high" in the list

  Scenario: Delete a task
    Given I have a task "Buy groceries"
    When I open the task detail for "Buy groceries"
    And I tap "Delete"
    And I confirm the deletion
    Then the task should no longer appear in my task list

  Scenario: Mark task as done
    Given I have a task "Buy groceries" with status "todo"
    When I tap the completion checkbox on "Buy groceries"
    Then the task status should change to "done"
    And the task should show a completed visual indicator
