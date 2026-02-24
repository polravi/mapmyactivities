Feature: AI-Powered Quadrant Suggestion
  As a user
  I want the app to suggest which quadrant a task belongs to
  So that I can prioritize faster with AI assistance

  Scenario: High-confidence suggestion is pre-selected
    Given I am creating a task
    When I enter title "Fix production server crash"
    And the AI returns quadrant Q1 with confidence 0.92
    Then Q1 should be pre-selected in the quadrant picker
    And I should see an "AI suggested" badge on Q1

  Scenario: Low-confidence suggestion shows all options
    Given I am creating a task
    When I enter title "Organize desk"
    And the AI returns quadrant Q4 with confidence 0.55
    Then all 4 quadrants should be shown as options
    And Q4 should be highlighted but not pre-selected

  Scenario: User overrides AI suggestion
    Given the AI suggested Q3 for my task
    When I select Q1 instead
    And I save the task
    Then eisenhowerQuadrant should be 1
    And aiSuggestedQuadrant should be 3
    And both values should be stored for analytics

  Scenario: Batch suggestion for unassigned tasks
    Given I have 5 tasks without quadrant assignments
    When I tap "Auto-organize"
    Then the AI should suggest quadrants for all 5 tasks
    And I should see a review screen with all suggestions
    And I can accept, override, or skip each one

  Scenario: AI suggestion graceful failure
    Given the Claude API is unavailable
    When I create a task
    Then the task should save without a suggestion
    And I should see "AI suggestion unavailable" message
    And I can manually assign a quadrant
