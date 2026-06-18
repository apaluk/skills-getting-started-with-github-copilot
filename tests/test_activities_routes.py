def test_get_activities_returns_activity_mapping(client):
    # Arrange
    known_activity = "Chess Club"

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert known_activity in data


def test_get_activities_items_have_expected_fields(client):
    # Arrange
    expected_fields = {"description", "schedule", "max_participants", "participants"}

    # Act
    response = client.get("/activities")

    # Assert
    assert response.status_code == 200
    activities_payload = response.json()
    first_activity = next(iter(activities_payload.values()))
    assert expected_fields.issubset(set(first_activity.keys()))
