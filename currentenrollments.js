document.addEventListener('DOMContentLoaded', function() {
    const clientId = getQueryParameter('id');

    function saveSelection(key, value) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        let client = clients.find(c => c.id === clientId) || { id: clientId };
        client[key] = value;
        if (!clients.includes(client)) clients.push(client);
        localStorage.setItem('clients', JSON.stringify(clients));
    }

    function loadSelection(key) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        const client = clients.find(c => c.id === clientId);
        return client ? client[key] : null;
    }

    function saveHouseholdMember(member) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        let client = clients.find(c => c.id === clientId) || { id: clientId, householdMembers: [] };
        if (!clients.includes(client)) clients.push(client);
        client.householdMembers = client.householdMembers || [];
        const existingMemberIndex = client.householdMembers.findIndex(m => m.householdMemberId === member.householdMemberId);
        if (existingMemberIndex !== -1) {
            client.householdMembers[existingMemberIndex] = member;
        } else {
            client.householdMembers.push(member);
        }
        localStorage.setItem('clients', JSON.stringify(clients));
        refreshHouseholdMembersUI();
    }

    function loadHouseholdMembers() {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        const client = clients.find(c => c.id === clientId);
        const householdMembers = client ? client.householdMembers || [] : [];
    
        // Automatically set "Is this person currently enrolled in PACE?" to "notinterested" if age is under 65
        householdMembers.forEach(member => {
            const dob = new Date(member.dob);
            const age = new Date().getFullYear() - dob.getFullYear();
            if (age < 65) {
                member['Is this person currently enrolled in PACE?'] = 'notinterested';
            }
            if (age > 65) {
                member['Is this person currently enrolled in PACE?'] = 'notinterested';
            }
            
            if (
                age < 18 || 
                (age >= 18 && age <50 && member.disability !== 'yes') || 
                (age >= 50 && age <65 && member.maritalStatus.toLowerCase() !== 'widowed') || 
                age <= 65
            ) {
                member['Has this person already applied for PTTR this year?'] = 'notinterested';
            }
            if (client.residencestatus === "other") {
                member['Has this person already applied for PTTR this year?'] = 'notinterested';
            }
            if (client.residencestatus !== "other") {
                member['Has this person already applied for PTTR this year?'] = '';
            }
            if (client.residencestatus !== "other" && !member['Has this person already applied for PTTR this year?']) {
                member['Has this person already applied for PTTR this year?'] = ''; // Only set if not already defined
            }

            
    
            // Apply conditional questions
            if (age >= 65 && !member.medicaid) {
                member['Is this person currently enrolled in PACE?'] = member['Is this person currently enrolled in PACE?'] || 'no';
            }
            if (member.medicare === 'yes' && !member.medicaid) {
                member['Is this person currently enrolled in LIS?'] = member['Is this person currently enrolled in LIS?'] || 'no';
                member['Is this person currently enrolled in MSP?'] = member['Is this person currently enrolled in MSP?'] || 'no';
            }

            if ((age >= 18 && age < 50 && member.disability === 'yes') || 
    (age >= 50 && age < 65 && member.maritalStatus.toLowerCase() === 'widowed') || 
    age >= 65) {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients.find(c => c.id === clientId);
}
        });
    
    
        return householdMembers;
    }

    function deleteHouseholdMember(memberId) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        let client = clients.find(c => c.id === clientId);
        if (client && client.householdMembers) {
            client.householdMembers = client.householdMembers.filter(m => m.householdMemberId !== memberId);
            localStorage.setItem('clients', JSON.stringify(clients));
            refreshHouseholdMembersUI();
        }
    }

    function addHouseholdMemberToUI(member) {
    const householdMemberContainer = document.getElementById('householdMemberContainer');
    const memberDiv = document.createElement('div');
    memberDiv.classList.add('household-member');
    memberDiv.setAttribute('data-id', member.householdMemberId);

    const dob = new Date(member.dob);
    const age = new Date().getFullYear() - dob.getFullYear();
    const isOnMedicare = member.medicare === 'yes';
    const isOnMedicaid = member.medicaid === 'yes';
    const isDisabled = member.disability === 'yes';
    const isWidowed = member.maritalStatus.toLowerCase() === 'widowed';

    memberDiv.innerHTML = `
        <p>Name: ${member.firstName} ${member.middleInitial} ${member.lastName}</p>
        <p>Date of Birth: ${member.dob}</p>
        <p>Age: ${age-1}</p>
        <p>Marital Status: ${member.maritalStatus}</p>
    `;

    let hasQuestions = false;

    if (age >= 65 && !isOnMedicaid) {
        hasQuestions = true;
        memberDiv.innerHTML += `
            <div class="selection-box">
                <label>Is this person currently enrolled in PACE?</label>
                <div data-value="yes" class="selection-option">Yes</div>
                <div data-value="no" class="selection-option">No</div>
                <div data-value="notinterested" class="selection-option">Not Interested</div>
            </div>
        `;
    }

    if (isOnMedicare && !isOnMedicaid) {
        hasQuestions = true;
        memberDiv.innerHTML += `
            <div class="selection-box">
                <label>Is this person currently enrolled in LIS?</label>
                <div data-value="yes" class="selection-option">Yes</div>
                <div data-value="no" class="selection-option">No</div>
                <div data-value="notinterested" class="selection-option">Not Interested</div>
            </div>
            <div class="selection-box">
                <label>Is this person currently enrolled in MSP?</label>
                <div data-value="yes" class="selection-option">Yes</div>
                <div data-value="no" class="selection-option">No</div>
                <div data-value="notinterested" class="selection-option">Not Interested</div>
            </div>
        `;
    }

    if ((age >= 18 && isDisabled) || (age >= 50 && isWidowed) || age >= 65) {
    const clients = JSON.parse(localStorage.getItem('clients')) || [];
    const client = clients.find(c => c.id === clientId);

    // Check if residencestatus is "other"
    if (client && client.residencestatus === "other") {
        hasQuestions = false; // Do not show the question
    } else {
        hasQuestions = true;
        memberDiv.innerHTML += `
            <div class="selection-box">
                <label>Has this person already applied for PTTR this year?</label>
                <div data-value="yes" class="selection-option">Yes</div>
                <div data-value="no" class="selection-option">No</div>
                <div data-value="notinterested" class="selection-option">Not Interested</div>
            </div>
        `;
    }
    }

householdMemberContainer.appendChild(memberDiv);

    // Add event listeners to save selections
memberDiv.querySelectorAll('.selection-option').forEach(option => {
    option.addEventListener('click', function () {
        const parent = this.parentElement;
        parent.querySelectorAll('.selection-option').forEach(sibling => sibling.classList.remove('selected'));
        this.classList.add('selected');

        const question = parent.querySelector('label').innerText.trim(); // Ensure no extra spaces
        const value = this.dataset.value;

        // Save the selection immediately
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        let client = clients.find(c => c.id === clientId) || { id: clientId, householdMembers: [] };
        if (!clients.includes(client)) clients.push(client);
        client.householdMembers = client.householdMembers || [];
        const memberIndex = client.householdMembers.findIndex(m => m.householdMemberId === member.householdMemberId);
        if (memberIndex !== -1) {
            client.householdMembers[memberIndex][question] = value; // Save the value for the correct question
        } else {
            // If the member doesn't exist, add them
            const newMember = { householdMemberId: member.householdMemberId };
            newMember[question] = value;
            client.householdMembers.push(newMember);
        }
        localStorage.setItem('clients', JSON.stringify(clients));

        // Debugging log
        console.log(`Saved: Question = "${question}", Value = "${value}"`);
    });
});

    // Recall and highlight selections on page load
const clients = JSON.parse(localStorage.getItem('clients')) || [];
const client = clients.find(c => c.id === clientId);
if (client) {
    const savedMember = client.householdMembers.find(m => m.householdMemberId === member.householdMemberId);
    if (savedMember) {
        memberDiv.querySelectorAll('.selection-box').forEach(box => {
            const question = box.querySelector('label').innerText.trim(); // Ensure no extra spaces
            const savedValue = savedMember[question];
            console.log(`Highlighting: Question = "${question}", Saved Value = "${savedValue}"`); // Debugging log
            if (savedValue) {
                const selectedOption = box.querySelector(`.selection-option[data-value="${savedValue}"]`);
                if (selectedOption) {
                    selectedOption.classList.add('selected');
                }
            }
        });
    }
}

    // Automatically set "Is this person currently enrolled in PACE?" to "not interested" if age is under 65
    if (age < 65) {
        const paceBox = Array.from(memberDiv.querySelectorAll('.selection-box label')).find(label => label.innerText === "Is this person currently enrolled in PACE?");
        if (paceBox) {
            const yesOption = paceBox.parentElement.querySelector('.selection-option[data-value="notinterested"]');
            if (yesOption) {
                yesOption.click();
            }
        }
    }
}

    function updateHouseholdMemberInUI(member) {
        const memberDiv = document.querySelector(`.household-member[data-id="${member.householdMemberId}"]`);
        if (memberDiv) {
            memberDiv.innerHTML = `
                <p>Name: ${member.firstName} ${member.middleInitial} ${member.lastName}</p>
                <p>Date of Birth: ${member.dob}</p>
                <p>Marital Status: ${member.maritalStatus}</p>
                <p>On Disability: ${member.disability === 'yes' ? 'Yes' : 'No'}</p>
                <p>On Medicare: ${member.medicare === 'yes' ? 'Yes' : 'No'}</p>
                <p>On Medicaid: ${member.medicaid === 'yes' ? 'Yes' : 'No'}</p>
                <p>Student: ${member.student === 'yes' ? 'Yes' : 'No'}</p>
                <p>Shares Meals: ${member.meals === 'yes' ? 'Yes' : 'No'}</p>
            `;
        }
    }

    function removeHouseholdMemberFromUI(memberId) {
        const memberDiv = document.querySelector(`.household-member[data-id="${memberId}"]`);
        if (memberDiv) {
            memberDiv.remove();
        }
    }

    function refreshHouseholdMembersUI() {
        const householdMemberContainer = document.getElementById('householdMemberContainer');
        householdMemberContainer.innerHTML = '';
        loadHouseholdMembers().forEach(member => {
            addHouseholdMemberToUI(member);
        });
    }

    function openEditModal(member) {
        document.getElementById('householdMemberId').value = member.householdMemberId;
        document.getElementById('firstName').value = member.firstName;
        document.getElementById('middleInitial').value = member.middleInitial;
        document.getElementById('lastName').value = member.lastName;
        document.getElementById('dob').value = member.dob;
        document.getElementById('maritalStatus').value = member.maritalStatus;
        setSelectionBox('#disabilityQuestion', member.disability);
        setSelectionBox('#medicareQuestion', member.medicare);
        setSelectionBox('#medicaidQuestion', member.medicaid);
        setSelectionBox('#studentQuestion', member.student);
        setSelectionBox('#mealsQuestion', member.meals);

        document.getElementById('householdMemberModalTitle').innerText = 'Edit Household Member';
        document.getElementById('add-member').style.display = 'none';
        document.getElementById('save-update').style.display = 'block';
        document.getElementById('delete-member').style.display = 'block';
        document.getElementById('householdMemberModal').style.display = 'block';

        // Simulate click on selected elements to update the UI
        document.querySelectorAll('.selection-box div.selected').forEach(div => {
            simulateClick(div);
        });

        document.getElementById('delete-member').onclick = function() {
            if (confirm('Are you sure you want to delete this household member? This action cannot be undone.')) {
                deleteHouseholdMember(member.householdMemberId);
                removeHouseholdMemberFromUI(member.householdMemberId);
                document.getElementById('householdMemberModal').style.display = 'none';
            }
        };
    }

    function updatePTTRForAllMembers(selectedMemberId, value) {
        const clients = JSON.parse(localStorage.getItem('clients')) || [];
        let client = clients.find(c => c.id === clientId);
        if (client && client.householdMembers) {
            client.householdMembers.forEach(member => {
                if (member.householdMemberId !== selectedMemberId) {
                    member['Has this person already applied for PTTR this year?'] = 'notinterested';
                }
            });
            localStorage.setItem('clients', JSON.stringify(clients));
            refreshHouseholdMembersUI();
        }
    }

    function setSelectionBox(selector, value) {
        const questionDiv = document.querySelector(selector);
        questionDiv.querySelectorAll('div').forEach(div => div.classList.remove('selected'));
        if (value !== undefined) {
            const selectedDiv = questionDiv.querySelector(`div[data-value="${value}"]`);
            if (selectedDiv) {
                selectedDiv.classList.add('selected');
            }
        }
    }

    function clearSelections() {
        document.querySelectorAll('.selection-box div.selected').forEach(div => {
            div.classList.remove('selected');
        });
    }

    document.querySelectorAll('.selection-box div').forEach(div => {
        div.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('div').forEach(sibling => sibling.classList.remove('selected'));
            this.classList.add('selected');
            handleConditionalQuestions(parent.id, this.dataset.value);

            // Save the selection immediately
            const memberId = document.getElementById('householdMemberId').value;
            if (memberId) {
                const member = {
                    householdMemberId: memberId,
                    firstName: document.getElementById('firstName').value,
                    middleInitial: document.getElementById('middleInitial').value,
                    lastName: document.getElementById('lastName').value,
                    dob: document.getElementById('dob').value,
                    maritalStatus: document.getElementById('maritalStatus').value,
                    disability: document.querySelector('#disabilityQuestion div.selected').dataset.value,
                    medicare: document.querySelector('#medicareQuestion div.selected').dataset.value,
                    medicaid: document.querySelector('#medicaidQuestion div.selected').dataset.value,
                    student: document.querySelector('#studentQuestion div.selected').dataset.value,
                    meals: document.querySelector('#mealsQuestion div.selected').dataset.value
                };
                saveHouseholdMember(member);
            }
        });
    });

    function handleConditionalQuestions(questionId, value) {
        if (questionId === 'disability-label' && value === 'yes') {
            document.getElementById('disabilityQuestion').style.display = 'block';
        } else if (questionId === 'disability-label' && value === 'no') {
            document.getElementById('disabilityQuestion').style.display = 'none';
        }
        // Add more conditional logic as needed
    }

    document.getElementById('household-size').addEventListener('change', function() {
        saveSelection('householdSize', this.value);
    });

    document.querySelectorAll('[id^="disability-"], [id^="medicare-"], [id^="medicaid-"], [id^="student-"], [id^="snap-"]').forEach(function(element) {
        element.addEventListener('click', function() {
            saveSelection(this.id.split('-')[0], this.dataset.value);
        });
    });

    const householdSize = loadSelection('householdSize');
    if (householdSize) {
        document.getElementById('household-size').value = householdSize;
    }

    ['disability', 'medicare', 'medicaid', 'student', 'snap'].forEach(function(key) {
        const value = loadSelection(key);
        if (value) {
            simulateClick(document.getElementById(`${key}-${value}`));
        }
    });

    document.querySelectorAll('.selection-box div.selected').forEach(div => {
        simulateClick(div);
    });

    loadHouseholdMembers().forEach(member => {
        addHouseholdMemberToUI(member);
    });

    document.getElementById('householdMemberForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const member = {
            householdMemberId: document.getElementById('householdMemberId').value || generateUniqueId(),
            firstName: document.getElementById('firstName').value,
            middleInitial: document.getElementById('middleInitial').value,
            lastName: document.getElementById('lastName').value,
            dob: document.getElementById('dob').value,
            maritalStatus: document.getElementById('maritalStatus').value,
            disability: document.querySelector('#disabilityQuestion div[data-value="yes"]').classList.contains('selected') ? 'yes' : 'no',
            medicare: document.querySelector('#medicareQuestion div[data-value="yes"]').classList.contains('selected') ? 'yes' : 'no',
            medicaid: document.querySelector('#medicaidQuestion div[data-value="yes"]').classList.contains('selected') ? 'yes' : 'no',
            student: document.querySelector('#studentQuestion div[data-value="yes"]').classList.contains('selected') ? 'yes' : 'no',
            meals: document.querySelector('#mealsQuestion div[data-value="yes"]').classList.contains('selected') ? 'yes' : 'no'
        };
        saveHouseholdMember(member);
        if (document.getElementById('householdMemberId').value) {
            updateHouseholdMemberInUI(member);
        } else {
            addHouseholdMemberToUI(member);
        }
        document.getElementById('householdMemberForm').reset();
        document.getElementById('householdMemberModal').style.display = 'none';
        refreshHouseholdMembersUI();
    });

    document.getElementById('add-household-member').addEventListener('click', function() {
        document.getElementById('householdMemberModalTitle').innerText = 'Add Household Member';
        document.getElementById('add-member').style.display = 'block';
        document.getElementById('save-update').style.display = 'none';
        document.getElementById('delete-member').style.display = 'none';
        document.getElementById('householdMemberModal').style.display = 'block';
        document.getElementById('householdMemberForm').reset();
    });

    document.getElementById('closeHouseholdMemberModal').addEventListener('click', function() {
        document.getElementById('householdMemberModal').style.display = 'none';
    });
});

function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function generateUniqueId() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}

function simulateClick(element) {
    if (element) {
        element.click();
    }
}