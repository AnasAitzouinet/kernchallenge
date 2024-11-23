import pytest


@pytest.mark.asyncio
def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"name": "John Doe", "email": "john@example.com", "password": "securepassword"}
    )
    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully"}

@pytest.mark.asyncio
async def test_login_user(client):
    # Register a user
    await client.post(
        "/api/v1/auth/register",
        json={"name": "John Doe", "email": "john@example.com", "password": "securepassword"}
    )

    # Attempt to log in
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "john@example.com", "password": "securepassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"
