Feature: Offline Task Management (Mobile)
  As a mobile user
  I want to create and edit tasks without internet
  So that I can capture tasks anywhere

  Scenario: Create task while offline
    Given I am signed in on the mobile app
    And my device is offline
    When I create a task "Call plumber"
    Then the task should appear in my local task list
    And I should see an "offline" indicator
    And the task should be stored in WatermelonDB

  Scenario: Edit task while offline
    Given I have an existing task "Call plumber"
    And my device is offline
    When I change the title to "Call plumber about leak"
    And I tap "Save"
    Then the change should be saved locally
    And the task should be queued for sync
