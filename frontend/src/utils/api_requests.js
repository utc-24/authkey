import { API_URL, IPFS_GATEWAY_URL } from "@static/constants/links"

export async function postBadgeRequest(badge) {
    let response;
    const badgeObj = {
        name: badge.name,
        description: badge.description,
        delegates: badge.delegates,
        image_hash: badge.image_hash,
        token_uri: badge.token_uri,
        account_bound: badge.account_bound,
        organization: badge.organization
    }

    try {
        await fetch(`${API_URL}/badges/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include',
            body: JSON.stringify(badgeObj)
        })
        .then(res => res.json())
        .then(data => {
            response = data;
        })
        .catch(err => {
            throw new Error(err);
        })
    }
    catch (err) {
        console.log('error creating badge', err);
        response = {error: err};
    }

    return response;
}

export async function postOrgRequest(org) {
    let response;
    console.log('orgObj', org)

    try {
        await fetch(`${API_URL}/organizations/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include',
            body: JSON.stringify(org)
        })
        .then(res => res.json())
        .then(data => {
            if (!data?.id) throw new Error("Org POST request failed, id not found");
            console.log('got org response', data);
            response = data;
        })
        .catch(err => {
            throw new Error(err);
        })
    }
    catch (err) {
        console.log('error creating org', err);
        response = {error: err}
    }

    return response;
}

export async function getUserRequest(address) {
    let response;
    try {
        await fetch(`${API_URL}/wallets/${address}/`, {
            method: "GET",
            mode: "cors",
            credentials: 'include',
            headers: {
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.length < 1) throw new Error("No user data found");
            console.log('got user data', data);
            response = data;
        })
        .catch(err => {
            throw new Error(err)
        })
    }
    catch (err) {
        console.log('error fetching user data', err);
        response = {error: err};
    }

    return response;
}

export async function getOrgRequest(orgId) {
    let response;
    try {
        await fetch(`${API_URL}/organizations/${orgId}`, {
            method: "GET",
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include'
        })
        .then(res => res.json())
        .then(data => {
            if (data.length < 1) throw new Error("No org data found");
            console.log('got org data', data);
            response = data;
        })
        .catch(err => {
            throw new Error(err);
        })
    }
    catch (err) {
        console.log('error fetching user data', err);
        response = {error: err}
    }

    return response
}

export async function postIPFSImage(image) {
    const formData = new FormData();
    formData.append('image', image)
    let response;

    try {
        await fetch(`${API_URL}/ipfs/pin-image/`, {
            method: "POST",
            mode: "cors",
            headers: {
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            response = data
        })
    }
    catch (err) {
        console.log('error uploading to ipfs', err)
        response = {error: err}
    }

    return response;
}

export async function postIPFSMetadata(badge) {
    let response;

    const metadata = {
        name: badge.name,
        description: badge.description,
        image: `${IPFS_GATEWAY_URL}/${badge.image_hash}`
    }

    try {
        await fetch(`${API_URL}/ipfs/pin-json/`, {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include',
            body: JSON.stringify({data: metadata})
        })
        .then(res => res.json())
        .then(data => {
            response = data
        })
    }
    catch (err) {
        console.log('error uploading metadata to ipfs', err)
        response = {error: err}
    }

    return response;
}

export async function patchBadgeStatus(url) {
    let response;

    try {
        await fetch(`${url}`, {
            method: "PATCH",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                'X-CSRFToken': document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'))[2],
            },
            credentials: 'include',
            body: JSON.stringify({is_active: true})
        })
        .then(res => res.json())
        .then(data => {
            response = data
        })
    }
    catch (err) {
        console.log('error updating badge status', err)
        response = {error: err}
    }

    return response;
}