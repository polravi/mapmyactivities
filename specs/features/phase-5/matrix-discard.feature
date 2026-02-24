Feature: Q4 Task Elimination
  As a user
  I want to discard tasks that are neither urgent nor important
  So that I can reduce noise and focus

  Scenario: Discard a Q4 task
    Given I have task "Browse social media stats" in Q4
    When I tap "Discard" on that task
    And I confirm the discard
    Then the task status should change to "discarded"
    And it should no longer appear in the matrix
    And it should appear in the "Discarded" archive

  Scenario: Recover a discarded task
    Given I have a discarded task "Browse social media stats"
    When I open the "Discarded" archive
    And I tap "Restore" on that task
    Then the task status should change to "todo"
    And it should appear in the unassigned section
