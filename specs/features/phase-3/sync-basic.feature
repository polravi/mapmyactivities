Feature: Cross-Platform Sync
  As a user with both mobile and web
  I want my tasks to sync across devices
  So that I always see the latest data

  Scenario: Task created on mobile appears on web
    Given I am signed in on both mobile and web
    And I create a task "Doctor appointment" on mobile
    When the mobile app syncs
    Then the task "Doctor appointment" should appear on the web app

  Scenario: Task edited on web syncs to mobile
    Given I have a task "Doctor appointment" on both platforms
    When I change the title to "Doctor appointment at 3pm" on web
    And the mobile app syncs
    Then the mobile task should show "Doctor appointment at 3pm"

  Scenario: Task deleted on one platform syncs to other
    Given I have a task "Old task" on both platforms
    When I delete "Old task" on web
    And the mobile app syncs
    Then "Old task" should not appear on mobile

  Scenario: Initial sync loads all tasks
    Given I have 10 tasks in Firestore
    And I sign in on a new mobile device
    When the initial sync completes
    Then I should see all 10 tasks on mobile
