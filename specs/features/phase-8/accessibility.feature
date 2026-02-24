Feature: Accessibility
  As a user with disabilities
  I want the app to be accessible
  So that I can use it with assistive technology

  Scenario: Screen reader reads task list
    Given I have 3 tasks in my list
    When I navigate the task list with a screen reader
    Then each task should announce: title, priority, due date, status

  Scenario: Matrix is keyboard navigable (web)
    Given I am on the matrix view
    When I use Tab to navigate between quadrants
    And I press Enter on a task
    Then the task detail should open
    And I can use arrow keys to move between tasks
