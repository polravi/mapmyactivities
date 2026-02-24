Feature: Drag-and-Drop Prioritization
  As a user
  I want to drag tasks between quadrants
  So that I can quickly reprioritize

  Scenario: Drag task from Q1 to Q2
    Given I have task "Prepare presentation" in Q1
    When I drag "Prepare presentation" to Q2
    Then the task should appear in Q2
    And the task's eisenhowerQuadrant should be 2
    And the change should sync to other devices

  Scenario: Drag unassigned task to quadrant
    Given I have an unassigned task "Read industry report"
    When I drag it to Q2 (Schedule)
    Then the task should appear in Q2
    And it should be removed from the unassigned section

  Scenario: Reorder within a quadrant
    Given I have tasks A, B, C in Q1
    When I drag task C above task A
    Then the order should be C, A, B
    And the sortOrder values should reflect the new order
