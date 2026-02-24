Feature: Goal Timeframe Views
  As a user
  I want to view my goals by day, week, month, and year
  So that I can focus on the right time horizon

  Scenario: Daily view shows today's tasks grouped by goal
    Given I have 3 daily goals with tasks for today
    When I open the daily view
    Then I should see tasks grouped under their goals
    And each goal should show its completion progress

  Scenario: Weekly view shows calendar with tasks
    Given I have tasks distributed across this week
    When I open the weekly view
    Then I should see a 7-day view with tasks on their due dates

  Scenario: Monthly view shows completion heatmap
    Given I have completed tasks across the current month
    When I open the monthly view
    Then I should see a calendar with color-coded completion density

  Scenario: Yearly view shows progress bars
    Given I have 3 yearly goals with varying progress
    When I open the yearly view
    Then I should see a progress bar for each yearly goal
