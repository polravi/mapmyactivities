Feature: Eisenhower Matrix View
  As a user
  I want to see my tasks organized in a 2x2 priority matrix
  So that I can focus on what's truly important

  Scenario: Matrix displays tasks in correct quadrants
    Given I have tasks assigned to all 4 quadrants
    When I open the matrix view
    Then Q1 (Do First) should show urgent+important tasks in red
    And Q2 (Schedule) should show important tasks in blue
    And Q3 (Delegate) should show urgent tasks in yellow
    And Q4 (Eliminate) should show low-priority tasks in gray

  Scenario: Unassigned tasks appear in staging area
    Given I have 3 tasks without a quadrant assignment
    When I open the matrix view
    Then I should see an "Unassigned" section with 3 tasks
