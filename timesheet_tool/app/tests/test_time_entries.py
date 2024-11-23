def test_create_time_entry(client):
    # Register and login to get token
    client.post(
        "/api/v1/auth/register",
        json={"name": "Jane Doe", "email": "jane@example.com", "password": "securepassword"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "jane@example.com", "password": "securepassword"}
    )
    token = login_response.json()["access_token"]

    # Create a project
    project_response = client.post(
        "/api/v1/projects/",
        json={"name": "Test Project", "description": "A project for testing"},
        headers={"Authorization": f"Bearer {token}"}
    )
    project_id = project_response.json()["id"]

    # Create a time entry
    response = client.post(
        "/api/v1/time_entries/",
        json={
            "project_id": project_id,
            "start_time": "2024-11-23T10:00:00",
            "end_time": "2024-11-23T12:00:00",
            "description": "Working on Test Project"
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["description"] == "Working on Test Project"
    assert response.json()["project_id"] == project_id


def test_list_time_entries(client):
    # Register and login to get token
    client.post(
        "/api/v1/auth/register",
        json={"name": "Jane Doe", "email": "jane@example.com", "password": "securepassword"}
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "jane@example.com", "password": "securepassword"}
    )
    token = login_response.json()["access_token"]

    # List time entries
    response = client.get(
        "/api/v1/time_entries/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 0
