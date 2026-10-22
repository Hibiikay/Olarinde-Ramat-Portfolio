const API_URL =
    "https://script.google.com/macros/s/AKfycbzQi3UWeGm0C56iel0FwHlU3KL2H5xUdoRDIoups2C2hIeK89YpYhKzaUSd5dYWmz5j/exec";


let token =
    sessionStorage.getItem(
        "ramat_admin_token"
    ) || "";


let currentData = {

    projects: [],

    skills: [],

    experience: [],

    certifications: [],

    stats: {}

};


const $ =
    selector =>
        document.querySelector(selector);



/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        bindEvents();


        if (token) {

            loadDashboard();

        } else {

            showLogin();

        }

    }
);



/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {


    $("#loginForm")
        .addEventListener(
            "submit",
            login
        );


    $("#logoutButton")
        .addEventListener(
            "click",
            logout
        );


    $("#openSidebar")
        .addEventListener(
            "click",
            function() {

                $("#sidebar")
                    .classList
                    .add("open");

                $("#sidebarOverlay")
                    .classList
                    .add("show");

            }
        );


    $("#closeSidebar")
        .addEventListener(
            "click",
            closeSidebar
        );


    $("#sidebarOverlay")
        .addEventListener(
            "click",
            closeSidebar
        );


    document
        .querySelectorAll(".nav-item")
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        showView(
                            button.dataset.view
                        );

                        closeSidebar();

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-open-form]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openForm(
                            button.dataset.openForm
                        );

                    }
                );

            }
        );


    $("#closeModal")
        .addEventListener(
            "click",
            closeModal
        );


    document
        .querySelector(
            "[data-close-modal]"
        )
        .addEventListener(
            "click",
            closeModal
        );

}



function closeSidebar() {

    $("#sidebar")
        .classList
        .remove("open");


    $("#sidebarOverlay")
        .classList
        .remove("show");

}



/* =========================================================
   API
========================================================= */


/* =========================================================
   API
========================================================= */


async function api(action, data = {}) {
    let response;

    try {
        response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify({
                action,
                ...data
            })
        });
    } catch (error) {
        throw new Error(
            "Could not connect to the API. Check the Netlify proxy and Apps Script deployment."
        );
    }

    let result;

    try {
        result = await response.json();
    } catch (error) {
        throw new Error(
            `The API returned an unreadable response (HTTP ${response.status}). Check the Apps Script deployment and Netlify proxy.`
        );
    }

    if (!response.ok) {
        throw new Error(`API request failed (HTTP ${response.status}).`);
    }

    if (result.success !== true) {
        throw new Error(result.error || "Request failed.");
    }

    return result;
}



/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();


    const username =
        $("#username")
            .value
            .trim();


    const password =
        $("#password")
            .value;


    $("#loginMessage")
        .textContent =
        "Signing in...";


    try {

        const result =
            await api(
                "login",
                {
                    username,
                    password
                }
            );


        token =
            result.token;


        sessionStorage.setItem(
            "ramat_admin_token",
            token
        );


        showAdmin();


        await loadDashboard();


    } catch (error) {

        $("#loginMessage")
            .textContent =
            error.message;

    }

}



function showLogin() {

    $("#loginScreen")
        .classList
        .remove("hidden");


    $("#adminApp")
        .classList
        .add("hidden");

}



function showAdmin() {

    $("#loginScreen")
        .classList
        .add("hidden");


    $("#adminApp")
        .classList
        .remove("hidden");

}



/* =========================================================
   LOGOUT
========================================================= */

async function logout() {

    try {

        if (token) {

            await api(
                "logout",
                {
                    token
                }
            );

        }

    } catch (_) {

    }


    token = "";


    sessionStorage.removeItem(
        "ramat_admin_token"
    );


    showLogin();

}



/* =========================================================
   LOAD DASHBOARD
========================================================= */

async function loadDashboard() {

    try {

        const result =
            await api(
                "dashboard",
                {
                    token
                }
            );


        currentData =
            result;


        showAdmin();


        renderStats();

        renderProjects();

        renderSkills();

        renderExperience();

        renderCertifications();

        renderDashboardProjects();


        $("#topbarUser")
            .textContent =
            "Admin";


    } catch (error) {


        if (
            error.message
                .toLowerCase()
                .includes("unauthorized")
        ) {

            token = "";

            sessionStorage.removeItem(
                "ramat_admin_token"
            );

            showLogin();

        } else {

            alert(
                error.message
            );

        }

    }

}



/* =========================================================
   NAVIGATION
========================================================= */

function showView(view) {

    document
        .querySelectorAll(".view")
        .forEach(
            function(section) {

                section
                    .classList
                    .remove(
                        "active-view"
                    );

            }
        );


    const target =
        $("#" + view + "View");


    if (target) {

        target
            .classList
            .add(
                "active-view"
            );

    }


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            function(button) {

                button
                    .classList
                    .toggle(
                        "active",
                        button.dataset.view === view
                    );

            }
        );


    const titles = {

        dashboard:
            "Dashboard",

        projects:
            "Projects",

        skills:
            "Skills",

        experience:
            "Experience",
        
        cv: "Manage CV",

        certifications: "Certifications"

    };


    $("#pageTitle")
        .textContent =
        titles[view] ||
        "Dashboard";

}



/* =========================================================
   STATS
========================================================= */

function renderStats() {

    const stats =
        currentData.stats;


    $("#statsGrid")
        .innerHTML = `

            <div class="stat-card">

                <strong>
                    ${stats.totalProjects || 0}
                </strong>

                <span>
                    Total Projects
                </span>

            </div>


            <div class="stat-card">

                <strong>
                    ${stats.publishedProjects || 0}
                </strong>

                <span>
                    Published
                </span>

            </div>


            <div class="stat-card">

                <strong>
                    ${stats.featuredProjects || 0}
                </strong>

                <span>
                    Featured
                </span>

            </div>


            <div class="stat-card">

                <strong>
                    ${stats.totalSkills || 0}
                </strong>

                <span>
                    Skills
                </span>

            </div>

        `;

}



/* =========================================================
   PROJECT TABLE
========================================================= */

function renderDashboardProjects() {

    const projects =
        currentData.projects
            .slice(0, 5);


    if (!projects.length) {

        $("#dashboardProjects")
            .innerHTML =
            `<div class="empty">
                No projects yet.
            </div>`;

        return;

    }


    $("#dashboardProjects")
        .innerHTML =
        projectTable(projects);

}



function renderProjects() {

    $("#projectsTable")
        .innerHTML =
        projectTable(
            currentData.projects
        );

}



function projectTable(
    projects
) {

    if (!projects.length) {

        return `
            <div class="empty">
                No projects found.
            </div>
        `;

    }


    return `

        <table>

            <thead>

                <tr>

                    <th>
                        ID
                    </th>

                    <th>
                        Project
                    </th>

                    <th>
                        Category
                    </th>

                    <th>
                        Featured
                    </th>

                    <th>
                        Status
                    </th>

                    <th>
                        Actions
                    </th>

                </tr>

            </thead>


            <tbody>

                ${projects.map(
                    function(project) {

                        const archived =
                            String(
                                project.Status || ""
                            ).toLowerCase() ===
                            "archived";


                        return `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        project.ID
                                    )}
                                </td>


                                <td>

                                    <strong>
                                        ${escapeHtml(
                                            project.Title
                                        )}
                                    </strong>

                                    <br>

                                    <small>
                                        ${escapeHtml(
                                            project[
                                                "Short Description"
                                            ] || ""
                                        )}
                                    </small>

                                </td>


                                <td>
                                    ${escapeHtml(
                                        project.Category
                                    )}
                                </td>


                                <td>
                                    ${escapeHtml(
                                        project.Featured
                                    )}
                                </td>


                                <td>

                                    <span
                                        class="status ${
                                            archived
                                                ? "archived"
                                                : "published"
                                        }"
                                    >

                                        ${escapeHtml(
                                            project.Status ||
                                            "Published"
                                        )}

                                    </span>

                                </td>


                                <td>

                                    <div class="actions">

                                        <button
                                            class="action"
                                            onclick="editProject('${safeAttr(project.ID)}')"
                                        >
                                            Edit
                                        </button>


                                        ${
                                            archived

                                            ? `

                                                <button
                                                    class="action"
                                                    onclick="restoreProject('${safeAttr(project.ID)}')"
                                                >
                                                    Restore
                                                </button>

                                            `

                                            : `

                                                <button
                                                    class="action"
                                                    onclick="archiveProject('${safeAttr(project.ID)}')"
                                                >
                                                    Archive
                                                </button>

                                            `
                                        }


                                        <button
                                            class="action danger"
                                            onclick="deleteProject('${safeAttr(project.ID)}')"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </td>

                            </tr>

                        `;

                    }
                ).join("")}

            </tbody>

        </table>

    `;

}



/* =========================================================
   SKILLS
========================================================= */

function renderSkills() {

    const skills =
        currentData.skills;


    if (!skills.length) {

        $("#skillsTable")
            .innerHTML =
            `<div class="empty">
                No skills found.
            </div>`;

        return;

    }


    $("#skillsTable")
        .innerHTML = `

            <table>

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Skill
                        </th>

                        <th>
                            Category
                        </th>

                        <th>
                            Description
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${skills.map(
                        function(skill) {

                            return `

                                <tr>

                                    <td>
                                        ${escapeHtml(
                                            skill.ID
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            ${escapeHtml(
                                                skill.Skill
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            skill.Category
                                        )}
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            skill.Description
                                        )}
                                    </td>

                                    <td>

                                        <div class="actions">

                                            <button
                                                class="action"
                                                onclick="editSkill('${safeAttr(skill.ID)}')"
                                            >
                                                Edit
                                            </button>


                                            <button
                                                class="action danger"
                                                onclick="deleteSkill('${safeAttr(skill.ID)}')"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            `;

                        }
                    ).join("")}

                </tbody>

            </table>

        `;

}



/* =========================================================
   EXPERIENCE
========================================================= */

function renderExperience() {

    const experience =
        currentData.experience;


    if (!experience.length) {

        $("#experienceTable")
            .innerHTML =
            `<div class="empty">
                No experience found.
            </div>`;

        return;

    }


    $("#experienceTable")
        .innerHTML = `

            <table>

                <thead>

                    <tr>

                        <th>
                            ID
                        </th>

                        <th>
                            Organization
                        </th>

                        <th>
                            Role
                        </th>

                        <th>
                            Dates
                        </th>

                        <th>
                            Current
                        </th>

                        <th>
                            Actions
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${experience.map(
                        function(item) {

                            return `

                                <tr>

                                    <td>
                                        ${escapeHtml(
                                            item.ID
                                        )}
                                    </td>

                                    <td>
                                        <strong>
                                            ${escapeHtml(
                                                item.Organization
                                            )}
                                        </strong>
                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            item.Role
                                        )}
                                    </td>

                                    <td>

                                        ${escapeHtml(
                                            item["Start Date"]
                                        )}

                                        –

                                        ${escapeHtml(
                                            item["End Date"]
                                        )}

                                    </td>

                                    <td>
                                        ${escapeHtml(
                                            item.Current
                                        )}
                                    </td>

                                    <td>

                                        <div class="actions">

                                            <button
                                                class="action"
                                                onclick="editExperience('${safeAttr(item.ID)}')"
                                            >
                                                Edit
                                            </button>


                                            <button
                                                class="action danger"
                                                onclick="deleteExperience('${safeAttr(item.ID)}')"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            `;

                        }
                    ).join("")}

                </tbody>

            </table>

        `;

}



/* =========================================================
   FORMS
========================================================= */

function openForm(
    type,
    item = null
) {


    if (type === "project") {

        openProjectForm(item);

    }


    if (type === "skill") {

        openSkillForm(item);

    }


    if (type === "experience") {

        openExperienceForm(item);

    }

    if (type === "certification") {

        openCertificationForm(item);

    }

}



/* PROJECT FORM */

function openProjectForm(
    item
) {

    const p =
        item || {

            ID: "P" + Date.now(),

            Title: "",

            Category:
                "Automation",

            "Short Description":
                "",

            Problem:
                "",

            Solution:
                "",

            Tools:
                "",

            Impact:
                "",

            "Image 1":
                "",

            "Image 2":
                "",

            "Image 3":
                "",

            "Demo URL":
                "",

            "GitHub URL":
                "",

            Date:
                new Date()
                    .getFullYear(),

            Featured:
                "No",

            Status:
                "Published"

        };


    const html = `

        <p class="eyebrow">
            ${item
                ? "EDIT PROJECT"
                : "NEW PROJECT"}
        </p>


        <h2>
            ${item
                ? "Edit Project"
                : "Add Project"}
        </h2>


        <form id="projectForm">


            <div class="form-grid">


                ${input(
                    "ID",
                    "ID",
                    p.ID,
                    !item,
                    true
                )}


                ${input(
                    "Title",
                    "Project Title",
                    p.Title
                )}


                ${input(
                    "Category",
                    "Category",
                    p.Category
                )}


                ${input(
                    "Date",
                    "Year",
                    p.Date,
                    false,
                    true,
                    "number"
                )}


                ${textarea(
                    "Short Description",
                    p["Short Description"],
                    true
                )}


                ${textarea(
                    "Problem",
                    p.Problem
                )}


                ${textarea(
                    "Solution",
                    p.Solution
                )}


                ${textarea(
                    "Tools",
                    p.Tools
                )}


                ${textarea(
                    "Impact",
                    p.Impact
                )}


                ${input(
                    "Image 1",
                    "Image 1 URL",
                    p["Image 1"],
                    false,
                    false
                )}
                ${imageUploadField(1, p["Image 1"])}


                ${input(
                    "Image 2",
                    "Image 2 URL",
                    p["Image 2"],
                    false,
                    false
                )}
                ${imageUploadField(2, p["Image 2"])}


                ${input(
                    "Image 3",
                    "Image 3 URL",
                    p["Image 3"],
                    false,
                    false
                )}
                ${imageUploadField(3, p["Image 3"])}


                ${input(
                    "Demo URL",
                    "Demo URL",
                    p["Demo URL"],
                    false,
                    false
                )}


                ${input(
                    "GitHub URL",
                    "GitHub URL",
                    p["GitHub URL"],
                    false,
                    false
                )}


                <label>

                    Featured

                    <select id="Featured">

                        <option
                            ${
                                p.Featured === "Yes"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Yes
                        </option>


                        <option
                            ${
                                p.Featured !== "Yes"
                                    ? "selected"
                                    : ""
                            }
                        >
                            No
                        </option>

                    </select>

                </label>


                <label>

                    Status

                    <select id="Status">

                        <option
                            ${
                                p.Status !== "Archived"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Published
                        </option>


                        <option
                            ${
                                p.Status === "Archived"
                                    ? "selected"
                                    : ""
                            }
                        >
                            Archived
                        </option>

                    </select>

                </label>


            </div>


            <div class="form-actions">

                <button
                    type="button"
                    class="button secondary"
                    data-close-form
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    Save Project
                </button>

            </div>


            <p
                id="formMessage"
                class="form-message"
            ></p>


        </form>

    `;


    openModal(html);
    bindImageUploadPreviews();


    $("#projectForm")
        .addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                const data = formToObject(event.target);

                data.Featured = $("#Featured").value;
                data.Status = $("#Status").value;

                const message = $("#formMessage");
                const submitButton = event.submitter;

                try {
                    if (submitButton) {
                        submitButton.disabled = true;
                        submitButton.textContent = "Uploading and saving...";
                    }

                    if (message) {
                        message.textContent = "Uploading selected images...";
                    }

                    // Upload only newly selected images.
                    // Existing image URLs remain unchanged.
                    await uploadSelectedProjectImages(data);

                    if (message) {
                        message.textContent = "Saving project...";
                    }

                    await save("saveProject", data);

                } catch (error) {
                    if (message) {
                        message.textContent = error.message;
                    } else {
                        alert(error.message);
                    }
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = "Save Project";
                    }
                }
            }
        );


    bindFormClose();

}



/* SKILL FORM */

function openSkillForm(
    item
) {

    const s =
        item || {

            ID: "",

            Skill: "",

            Category: "",

            Description: ""

        };


    const html = `

        <p class="eyebrow">
            ${item
                ? "EDIT SKILL"
                : "NEW SKILL"}
        </p>


        <h2>
            ${item
                ? "Edit Skill"
                : "Add Skill"}
        </h2>


        <form id="skillForm">


            ${input(
                "ID",
                "ID",
                s.ID,
                !item,
                true
            )}


            ${input(
                "Skill",
                "Skill Name",
                s.Skill
            )}


            ${input(
                "Category",
                "Category",
                s.Category
            )}


            ${textarea(
                "Description",
                s.Description
            )}


            <div class="form-actions">

                <button
                    type="button"
                    class="button secondary"
                    data-close-form
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    Save Skill
                </button>

            </div>


            <p
                id="formMessage"
                class="form-message"
            ></p>


        </form>

    `;


    openModal(html);


    $("#skillForm")
        .addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                await save(
                    "saveSkill",
                    formToObject(
                        event.target
                    )
                );

            }
        );


    bindFormClose();

}



/* EXPERIENCE FORM */

function openExperienceForm(
    item
) {

    const x =
        item || {

            ID: "",

            Organization: "",

            Role: "",

            "Start Date": "",

            "End Date": "",

            Description: "",

            Current: "No"

        };


    const html = `

        <p class="eyebrow">
            ${item
                ? "EDIT EXPERIENCE"
                : "NEW EXPERIENCE"}
        </p>


        <h2>
            ${item
                ? "Edit Experience"
                : "Add Experience"}
        </h2>


        <form id="experienceForm">


            ${input(
                "ID",
                "ID",
                x.ID,
                !item,
                true
            )}


            ${input(
                "Organization",
                "Organization",
                x.Organization
            )}


            ${input(
                "Role",
                "Role",
                x.Role
            )}


            ${input(
                "Start Date",
                "Start Date",
                x["Start Date"]
            )}


            ${input(
                "End Date",
                "End Date",
                x["End Date"]
            )}


            ${textarea(
                "Description",
                x.Description
            )}


            <label>

                Current

                <select id="Current">

                    <option
                        ${
                            x.Current === "Yes"
                                ? "selected"
                                : ""
                        }
                    >
                        Yes
                    </option>


                    <option
                        ${
                            x.Current !== "Yes"
                                ? "selected"
                                : ""
                        }
                    >
                        No
                    </option>

                </select>

            </label>


            <div class="form-actions">

                <button
                    type="button"
                    class="button secondary"
                    data-close-form
                >
                    Cancel
                </button>


                <button
                    type="submit"
                    class="button primary"
                >
                    Save Experience
                </button>

            </div>


            <p
                id="formMessage"
                class="form-message"
            ></p>


        </form>

    `;


    openModal(html);


    $("#experienceForm")
        .addEventListener(
            "submit",
            async function(event) {

                event.preventDefault();


                const data =
                    formToObject(
                        event.target
                    );


                data.Current =
                    $("#Current").value;


                await save(
                    "saveExperience",
                    data
                );

            }
        );


    bindFormClose();

}




/* CERTIFICATION FORM */

function openCertificationForm(item) {
    const c = item || {
        ID: "C" + Date.now(),
        Name: "",
        Issuer: "",
        Date: "",
        Status: "Published",
        Description: "",
        "Certificate URL": ""
    };

    const html = `
        <p class="eyebrow">${item ? "EDIT CERTIFICATION" : "NEW CERTIFICATION"}</p>
        <h2>${item ? "Edit Certification" : "Add Certification"}</h2>

        <form id="certificationForm">
            <div class="form-grid">
                ${input("ID", "ID", c.ID, !item, true)}
                ${input("Name", "Certification Name", c.Name)}
                ${input("Issuer", "Issuing Organisation", c.Issuer)}
                ${input("Date", "Date Awarded (or Expected)", c.Date, false, false)}
                <label>
                    Visibility
                    <select id="CertificationStatus" name="Status">
                        <option value="Published" ${String(c.Status || "Published").toLowerCase() === "published" ? "selected" : ""}>Published</option>
                        <option value="Hidden" ${String(c.Status || "").toLowerCase() === "hidden" ? "selected" : ""}>Hidden</option>
                    </select>
                </label>
                ${textarea("Description", c.Description || "", true)}
                ${input("Certificate URL", "Certificate / Credential URL", c["Certificate URL"] || "", false, false)}
            </div>

            <div class="form-actions">
                <button type="button" class="button secondary" data-close-form>Cancel</button>
                <button type="submit" class="button primary">Save Certification</button>
            </div>
            <p id="formMessage" class="form-message"></p>
        </form>
    `;

    openModal(html);

    $("#certificationForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        const data = formToObject(event.target);
        data.Status = $("#CertificationStatus").value;
        await save("saveCertification", data);
    });

    bindFormClose();
}


/* CERTIFICATIONS TABLE */

function renderCertifications() {
    const container = $("#certificationsTable");
    if (!container) return;

    const certifications = currentData.certifications || [];

    if (!certifications.length) {
        container.innerHTML = `<div class="empty">No certifications added yet.</div>`;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Certification</th>
                    <th>Issuer</th>
                    <th>Date</th>
                    <th>Visibility</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${certifications.map(function(item) {
                    const status = String(item.Status || "Published");
                    return `
                        <tr>
                            <td>${escapeHtml(item.ID)}</td>
                            <td>
                                <strong>${escapeHtml(item.Name)}</strong>
                                ${item["Certificate URL"] && /^https?:\/\//i.test(String(item["Certificate URL"])) ? `<br><a href="${escapeAttr(item["Certificate URL"])}" target="_blank" rel="noopener noreferrer">View credential</a>` : ""}
                                ${item.Description ? `<br><small>${escapeHtml(item.Description)}</small>` : ""}
                            </td>
                            <td>${escapeHtml(item.Issuer)}</td>
                            <td>${escapeHtml(item.Date)}</td>
                            <td>${escapeHtml(status)}</td>
                            <td>
                                <div class="actions">
                                    <button class="action" onclick="editCertification('${safeAttr(item.ID)}')">Edit</button>
                                    <button class="action danger" onclick="deleteCertification('${safeAttr(item.ID)}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join("")}
            </tbody>
        </table>
    `;
}


/* =========================================================
   FORM HELPERS
========================================================= */

function input(
    id,
    label,
    value = "",
    readonly = false,
    required = true,
    type = "text"
) {

    return `

        <label>

            ${escapeHtml(label)}


            <input

                id="${escapeHtml(id)}"

                name="${escapeHtml(id)}"

                type="${type}"

                value="${escapeAttr(value)}"

                ${readonly
                    ? "readonly"
                    : ""}

                ${required
                    ? "required"
                    : ""}

            >

        </label>

    `;

}



function textarea(
    id,
    value = "",
    full = false
) {

    return `

        <label
            class="${full
                ? "form-full"
                : ""}"
        >

            ${escapeHtml(id)}


            <textarea
                id="${escapeHtml(id)}"
                name="${escapeHtml(id)}"
            >${escapeHtml(value)}</textarea>

        </label>

    `;

}


/* =========================================================
   PROJECT IMAGE UPLOAD UI
========================================================= */

function imageUploadField(slot, existingUrl = "") {
    const url = escapeAttr(existingUrl);

    return `
        <div class="image-upload-field form-full">
            <label for="imageFile${slot}">
                Upload Image ${slot}
            </label>

            <input
                id="imageFile${slot}"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
            >

            <p class="upload-hint">
                JPG, PNG, WEBP or GIF. Maximum 4 MB.
                Selecting a file uploads it when you save the project.
            </p>

            <div
                id="imagePreviewWrap${slot}"
                class="image-preview-wrap ${url ? "" : "hidden"}"
            >
                <img
                    id="imagePreview${slot}"
                    class="image-preview"
                    src="${url}"
                    alt="Project image ${slot} preview"
                >
            </div>
        </div>
    `;
}


/**
 * Convert a browser File into base64 without the data URL prefix.
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = String(reader.result || "");
            const comma = result.indexOf(",");

            if (comma === -1) {
                reject(new Error("Could not read the selected image."));
                return;
            }

            resolve(result.slice(comma + 1));
        };

        reader.onerror = () => {
            reject(new Error("Failed to read the selected image."));
        };

        reader.readAsDataURL(file);
    });
}


/**
 * Show a preview immediately after a file is selected.
 */
function bindImageUploadPreviews() {
    [1, 2, 3].forEach(slot => {
        const fileInput = document.querySelector("#imageFile" + slot);

        if (!fileInput) return;

        fileInput.addEventListener("change", () => {
            const file = fileInput.files && fileInput.files[0];
            const preview = document.querySelector("#imagePreview" + slot);
            const wrap = document.querySelector("#imagePreviewWrap" + slot);

            if (!file) return;

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ];

            if (!allowedTypes.includes(file.type)) {
                alert("Choose a JPG, PNG, WEBP or GIF image.");
                fileInput.value = "";
                return;
            }

            if (file.size > 4 * 1024 * 1024) {
                alert("The maximum image size is 4 MB.");
                fileInput.value = "";
                return;
            }

            preview.src = URL.createObjectURL(file);
            wrap.classList.remove("hidden");
        });
    });
}


/**
 * Upload any selected images and put their Drive URLs into the project.
 * Existing URLs are retained for slots with no newly selected file.
 */
async function uploadSelectedProjectImages(data) {
    for (const slot of [1, 2, 3]) {
        const fileInput = document.querySelector("#imageFile" + slot);
        const file = fileInput && fileInput.files
            ? fileInput.files[0]
            : null;

        if (!file) continue;

        const base64 = await fileToBase64(file);

        const result = await api("uploadProjectImage", {
            token,
            projectId: data.ID,
            slot: String(slot),
            mimeType: file.type,
            base64
        });

        data["Image " + slot] = result.url;
    }

    return data;
}



function formToObject(
    form
) {

    const data = {};

    new FormData(form)
        .forEach(
            function(value, key) {

                data[key] = value;

            }
        );


    return data;

}



function bindFormClose() {

    document
        .querySelectorAll(
            "[data-close-form]"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    closeModal
                );

            }
        );

}



/* =========================================================
   SAVE
========================================================= */

async function save(
    action,
    data
) {

    const message =
        $("#formMessage");


    if (message) {

        message.textContent =
            "Saving...";

    }


    try {

        const result =
            await api(
                action,
                {
                    token,
                    data
                }
            );


        closeModal();


        await loadDashboard();


        alert(
            result.message
        );


    } catch (error) {

        if (message) {

            message.textContent =
                error.message;

        }

    }

}



/* =========================================================
   PROJECT ACTIONS
========================================================= */

window.editProject =
    function(id) {

        const item =
            currentData.projects.find(
                function(project) {

                    return String(
                        project.ID
                    ) === String(id);

                }
            );


        if (item) {

            openForm(
                "project",
                item
            );

        }

    };



window.archiveProject =
    async function(id) {

        if (
            !confirm(
                "Archive this project?"
            )
        ) {

            return;

        }


        try {

            const result =
                await api(
                    "archiveProject",
                    {
                        token,
                        id
                    }
                );


            await loadDashboard();


            alert(
                result.message
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };



window.restoreProject =
    async function(id) {

        try {

            const result =
                await api(
                    "restoreProject",
                    {
                        token,
                        id
                    }
                );


            await loadDashboard();


            alert(
                result.message
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };



window.deleteProject =
    async function(id) {

        if (
            !confirm(
                "Permanently delete this project? This cannot be undone."
            )
        ) {

            return;

        }


        try {

            const result =
                await api(
                    "deleteProject",
                    {
                        token,
                        id
                    }
                );


            await loadDashboard();


            alert(
                result.message
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };



/* =========================================================
   SKILL ACTIONS
========================================================= */

window.editSkill =
    function(id) {

        const item =
            currentData.skills.find(
                function(skill) {

                    return String(
                        skill.ID
                    ) === String(id);

                }
            );


        if (item) {

            openForm(
                "skill",
                item
            );

        }

    };



window.deleteSkill =
    async function(id) {

        if (
            !confirm(
                "Permanently delete this skill?"
            )
        ) {

            return;

        }


        try {

            const result =
                await api(
                    "deleteSkill",
                    {
                        token,
                        id
                    }
                );


            await loadDashboard();


            alert(
                result.message
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };



/* =========================================================
   EXPERIENCE ACTIONS
========================================================= */

window.editExperience =
    function(id) {

        const item =
            currentData.experience.find(
                function(experience) {

                    return String(
                        experience.ID
                    ) === String(id);

                }
            );


        if (item) {

            openForm(
                "experience",
                item
            );

        }

    };



window.deleteExperience =
    async function(id) {

        if (
            !confirm(
                "Permanently delete this experience record?"
            )
        ) {

            return;

        }


        try {

            const result =
                await api(
                    "deleteExperience",
                    {
                        token,
                        id
                    }
                );


            await loadDashboard();


            alert(
                result.message
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };




/* =========================================================
   CERTIFICATION ACTIONS
========================================================= */

window.editCertification = function(id) {
    const item = (currentData.certifications || []).find(
        certification => String(certification.ID) === String(id)
    );
    if (item) openForm("certification", item);
};

window.deleteCertification = async function(id) {
    if (!confirm("Permanently delete this certification?")) return;

    try {
        const result = await api("deleteCertification", { token, id });
        await loadDashboard();
        alert(result.message || "Certification deleted.");
    } catch (error) {
        alert(error.message);
    }
};


/* =========================================================
   MODAL
========================================================= */

function openModal(
    html
) {

    $("#modalBody")
        .innerHTML =
        html;


    $("#modal")
        .classList
        .remove("hidden");


    $("#modal")
        .setAttribute(
            "aria-hidden",
            "false"
        );


    document.body.style.overflow =
        "hidden";

}



function closeModal() {

    $("#modal")
        .classList
        .add("hidden");


    $("#modal")
        .setAttribute(
            "aria-hidden",
            "true"
        );


    document.body.style.overflow =
        "";

}



/* =========================================================
   SECURITY / HTML HELPERS
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



function escapeAttr(
    value
) {

    return escapeHtml(
        value
    );

}



function safeAttr(
    value
) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "\\",
            "\\\\"
        )

        .replaceAll(
            "'",
            "\\'"
        );

}



async function loadPublishedCV() {
  const status = document.getElementById("adminCVStatus");
  const viewLink = document.getElementById("adminViewCV");

  try {
    const response = await fetch(API_URL + "?action=cv");
    const result = await response.json();

    if (result.success && result.available) {
      viewLink.href = result.viewUrl;
      viewLink.hidden = false;
      status.textContent =
        "Published CV: " + result.fileName;
    } else {
      viewLink.hidden = true;
      status.textContent = "No CV has been published yet.";
    }
  } catch (error) {
    status.textContent = "Could not load the current CV details.";
  }
}


document.getElementById("cvUploadForm")?.addEventListener(
  "submit",
  async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("cvFile");
    const status = document.getElementById("adminCVStatus");
    const button = document.getElementById("uploadCVButton");
    const file = fileInput.files[0];

    if (!file) {
      status.textContent = "Please choose your CV PDF.";
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      status.textContent = "Please select a PDF file.";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      status.textContent = "The CV must be 5 MB or smaller.";
      return;
    }

    button.disabled = true;
    status.textContent = "Uploading your CV…";

    try {
      const reader = new FileReader();

      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const result = String(reader.result);
          resolve(result.substring(result.indexOf(",") + 1));
        };
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
      });

      const result = await api("uploadCV", {
        token,
        fileName: file.name,
        mimeType: "application/pdf",
        fileData: base64
      });

      if (!result || !result.success) {
        throw new Error(result?.message || "Upload failed.");
      }

      status.textContent = "CV uploaded and published successfully.";
      fileInput.value = "";
      await loadPublishedCV();
    } catch (error) {
      status.textContent =
        error.message || "Upload failed. Please try again.";
    } finally {
      button.disabled = false;
    }
  }
);


// Load the current CV when the admin page is ready.
loadPublishedCV();
