def test_create_project(client):
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
    response = client.post(
        "/api/v1/projects/",
        json={"name": "Test Project", "description": "A project for testing"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Project"
    assert response.json()["description"] == "A project for testing"


def test_list_projects(client):
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
    client.post(
        "/api/v1/projects/",
        json={"name": "Test Project", "description": "A project for testing"},
        headers={"Authorization": f"Bearer {token}"}
    )

    # List projects
    response = client.get(
        "/api/v1/projects/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["name"] == "Test Project"
