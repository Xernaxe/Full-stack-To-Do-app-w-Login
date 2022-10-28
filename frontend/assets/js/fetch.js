const loginBtn = document.querySelector('.loginBtn');
const logoutBtn = document.querySelector('.logoutBtn');
const registerBtn = document.querySelector('.registerBtn');

const loginSection = document.querySelector('.logtab');
const username = document.querySelector('#uName');
const email = document.querySelector('#Email');
const password = document.querySelector('#Psw');

const taskAddBtn = document.querySelector('.taskAddBtn');
const taskInput = document.querySelector('.taskInput');

const profileSection = document.querySelector('.profileSection');
const profileUserName = document.querySelector('.profileUserName');
const profileEmail = document.querySelector('.profileEmail');
const settingsBtn = document.querySelector('.settings');
const modalBackground = document.querySelector('.modalBackground');
const profileSettingsBox = document.querySelector('.profileSettings');
const profileSettingsName = document.querySelector('.profileSettingsName');
const profileSettingsEmail = document.querySelector('.profileSettingsEmail');
const changeEmailInput = document.querySelector('.changeEmailInput');
const changeEmailBtn = document.querySelector('.changeEmailBtn');

const taskSection = document.querySelector('.todoSection');
const tasksWrapper = document.querySelector('.tasksWrapper');

const checkEmail = document.querySelector('.checkEmail');
const checkPassword = document.querySelector('.checkPassword');

const labelArr = document.querySelectorAll('.label');
const labelName = document.querySelector('.labelName');
const labelEmail = document.querySelector('.labelEmail');
const labelPassword = document.querySelector('.labelPassword');

const noAccountBtn = document.querySelector('.noAccount');
const logtabUsername = document.querySelector('.logtabUsername');
const logtabEmailPassword = document.querySelector('.logtabEmailPassword');

const changeEmailLabel = document.querySelector('.changeEmailLabel');

const ls = window.localStorage;
const URL = `https://wad-todoapp-api-s21-group7.azurewebsites.net`;

window.addEventListener('DOMContentLoaded', (e) => {
	// checking if account credentials have been saved, if true automatically fill the input fields.
	if (ls.getItem('savedEmail')) {
		console.log(ls.getItem('savedEmail'));
		email.value = ls.getItem('savedEmail');
		checkEmail.checked = true;
	}
	if (ls.getItem('savedPassword')) {
		password.value = ls.getItem('savedPassword');
		checkPassword.checked = true;
	}

	let account;
	// checking if localstorage contains the account, if yes update UI with account details
	if (ls.getItem('account')) {
		account = JSON.parse(ls.getItem('account'));
		console.log(`account exists`);
		console.log(account);
		profileUserName.textContent = account.name;
		profileEmail.textContent = account.email;

		profileSettingsName.innerHTML = `Name: ${account.name}`;
		profileSettingsEmail.innerHTML = `Email: ${account.email}`;
		tasksWrapper.innerHTML = '';

		// checking if the account has any tasks, if true display them
		if (account.tasks) {
			account.tasks.forEach((element) => {
				//populating the tasksWrapper with new tasks
				//templating all the way down
				let newTask = document.createElement('li');
				newTask.innerHTML = `${element.taskDetails.desc} <span class="close">x</span>`;
				newTask.setAttribute('data-taskId', element.id); //custom attributes for taskId to be used later  (data-'something' is the standard (https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes))
				newTask.setAttribute('data-taskCompl', element.taskDetails.compl); // ^^
				tasksWrapper.appendChild(newTask); //append task

				//checking if taskcompl = true/false, if true add classlist taskcompleted
				if (element.taskDetails.compl == 1) {
					newTask.classList.add('taskCompleted');
				}
				if (element.taskDetails.compl == 0) {
					newTask.innerHTML += `<span class="completed">O</span>`;
				}
			});

			// close button for each individual task
			const closeBtn = document.querySelectorAll('.close');
			closeBtn.forEach((btn) => {
				btn.addEventListener('click', () => {
					// add event listener for each closeBtn
					// console.log(btn.parentElement.dataset.taskid)
					let token = ls.getItem('token'); // prepare token for the fetch req
					let indexToBeDeleted = account.tasks.findIndex(
						// find this item's index in the tasks array
						(task) => task.id == btn.parentElement.dataset.taskid //using the metadata that we have stored with custom attributes
					);
					account.tasks.splice(indexToBeDeleted, 1); // returns the array without the task that we wanted to delete
					ls.setItem('account', JSON.stringify(account)); // update the localstorage account with the new account information (since we deleted the task)
					btn.parentElement.remove(); //removes from the dom the task
					fetch(`${URL}/api/tasks/task/${btn.parentElement.dataset.taskid}`, {
						// fetch req to also delete the account from the DB using as a parameter the task's id
						method: 'DELETE',
						headers: {
							'Content-type': 'application/json',
							'x-authentication-token': token,
						},
					});
				});
			});
			const completedBtn = document.querySelectorAll('.completed'); // TO BE WORKED ON
			completedBtn.forEach((btn) => {
				btn.addEventListener('click', () => {
					console.log(
						`${btn.parentElement.dataset.taskid} + ${btn.parentElement.dataset.taskcompl}`
					);
					btn.parentElement.dataset.taskcompl = 1;
					btn.parentElement.classList.toggle('taskCompleted');
				});
			});
		}
	}

	if (!ls.getItem('account')) {
		// conditionally displaying the UI
		console.log('no account');
		loginSection.classList.toggle('displayNone');
		logoutBtn.classList.toggle('displayNone');
		taskSection.classList.toggle('displayNone');
		profileSection.classList.toggle('displayNone');
	}
});

settingsBtn.addEventListener('click', (e) => {
	changeEmailLabel.innerHTML = 'Change your email here:';
	modalBackground.classList.toggle('displayNone');
	profileSettingsBox.classList.toggle('displayNone');
});

modalBackground.addEventListener('click', (e) => {
	modalBackground.classList.toggle('displayNone');
	profileSettingsBox.classList.toggle('displayNone');
});

changeEmailBtn.addEventListener('click', (e) => {
	// change email
	if (changeEmailInput.value) {
		// run the code only if changeEmailInpu has something in it
		const account = JSON.parse(ls.getItem('account')); // grabs account
		let token = ls.getItem('token'); // also the token
		const payload = {
			//payload for the fetch request
			email: changeEmailInput.value,
		};
		const fetchOptions = {
			// fetchOptions for the fetch request with method PUT
			method: 'PUT',
			headers: {
				'Content-type': 'application/json',
				'x-authentication-token': token,
			},
			body: JSON.stringify(payload),
		};
		fetch(`${URL}/api/accounts/${account.userId}`, fetchOptions)
			.then(function (response) {
				if (!response.ok) {
					if (response.status === 400) {
						changeEmailLabel.innerHTML +=
							'<span class="conflict">Email format is wrong.</span>';
					}
				} else {
					changeEmailLabel.innerHTML +=
						'<span class="conflict">Email changed!</span>';
					return response.json();
				}
			})
			.then(function (data) {
				if (data) {
					ls.setItem('account', JSON.stringify(data));
					profileEmail.textContent = data.email;
					profileSettingsEmail.innerHTML = `Email: ${data.email}`;
				}
			});
	}
});

/* log in to existing account */
loginBtn.addEventListener('click', (e) => {
	//managing the login
	if (checkEmail.checked) {
		//check if checkEmail === true
		ls.setItem('savedEmail', email.value); // store in localstorage the email.value upon hitting login button
	} else {
		ls.removeItem('savedEmail');
	}
	if (checkPassword.checked) {
		// also for password
		ls.setItem('savedPassword', password.value);
	} else {
		ls.removeItem('savedPassword');
	}

	labelEmail.innerHTML = 'Email';
	labelName.innerHTML = 'Username';
	labelPassword.innerHTML = 'Password';

	const payload = {
		//payload for the login fetch req
		email: email.value,
		password: password.value,
	};

	const fetchOptions = {
		// fetchOptions for the login fetch req
		method: 'POST',
		headers: {
			'Content-type': 'application/json',
		},
		body: JSON.stringify(payload),
	};

	fetch(`${URL}/api/login`, fetchOptions) // fetch req to get the token, validate account credentials and get account details
		.then((response) => {
			const token = response.headers.get('x-authentication-token');
			ls.setItem('token', token);
			return response.json();
		})
		.then((data) => {
			ls.setItem('account', JSON.stringify(data));
			if (data.userId) {
				fetch(`${URL}/api/accounts/${data.userId}`, {
					method: 'GET',
					headers: {
						'x-authentication-token': data.jwt,
					},
				})
					.then((response) => {
						return response.json();
					})
					.then((data) => {
						ls.setItem('account', JSON.stringify(data)); // setting account into localstorage
						window.location.reload(); // reload page
					});
			} else {
				console.log('bad request error');

				labelEmail.innerHTML += `<span class="conflict">Invalid credentials</span>`;
				labelPassword.innerHTML +=
					'<span class="conflict">Invalid credentials</span>';
				ls.removeItem('account');
				ls.removeItem('token');
			}
		});
});

/* log out */
logoutBtn.addEventListener('click', (e) => {
	//logout button
	ls.removeItem('account'); // removes account from localstorage
	ls.removeItem('token'); // removes token from localstorage
	window.location.reload(); // reloads page
});

/* create account */
registerBtn.addEventListener('click', (e) => {
	if (username.value && email.value && password.value) {
		labelEmail.innerHTML = 'Email';
		labelName.innerHTML = 'Username';
		const payload = {
			// payload for the fetch req
			name: username.value,
			email: email.value,
			password: password.value,
		};

		const fetchOptions = {
			// fetchOptons for the fetch req
			method: 'POST',
			headers: {
				'Content-type': 'application/json',
			},
			body: JSON.stringify(payload),
		};

		fetch(`${URL}/api/accounts`, fetchOptions).then((response) => {
			if (response.ok == false) {
				console.log(response.status);
				if (response.status === 409) {
					labelArr.forEach((item) => {
						item.innerHTML += `<span class="conflict">Username or email already used!</span>`;
					});
				}
				if (response.status === 400) {
					labelArr.forEach((item) => {
						item.innerHTML += `<span class="conflict">Invalid Credentials</span>`;
					});
				}
			} else {
				labelArr.forEach((item) => {
					item.innerHTML += `<span class="conflict">Confirmed! You can login now</span>`;
				});
				registerBtn.classList.toggle('displayNone');
				logtabUsername.classList.toggle('displayNone');
				noAccountBtn.classList.toggle('displayNone');
			}
			return response.json();
		});
	}
});

noAccountBtn.addEventListener('click', (e) => {
	if (registerBtn.classList.contains('displayNone')) {
		registerBtn.classList.toggle('displayNone');
		logtabUsername.classList.toggle('displayNone');
		noAccountBtn.classList.toggle('displayNone');
		labelEmail.innerHTML = 'Email';
		labelName.innerHTML = 'Username';
		labelPassword.innerHTML = 'Password';
		username.value = ''
		email.value = ''
		password.value = ''
	}
});

/* add new task */
taskAddBtn.addEventListener('click', () => {
	if (taskInput.value) {
		// if taskInput has something in it only then continue
		const account = JSON.parse(ls.getItem('account')); // get account
		if (!account.tasks) {
			// if the account is new thus it does not have any tasks create a task array which we can later populate with the task following the same structure
			account.tasks = [];
		}
		let taskContent = taskInput.value;
		let payload = {
			// payload for the fetch req
			taskDescription: taskContent,
			taskCompleted: 0,
		};

		let newTask = document.createElement('li'); //add task to the dom as we did before
		newTask.innerHTML = `${taskContent} <span class="close">x</span>`;
		newTask.innerHTML += `<span class="completed">O</span>`;
		tasksWrapper.appendChild(newTask);

		let token = ls.getItem('token'); //grab token
		fetch(`${URL}/api/tasks/task/${account.userId}`, {
			// fetch req using account id as param
			method: 'POST',
			body: JSON.stringify(payload),
			headers: {
				'Content-type': 'application/json',
				'x-authentication-token': token,
			},
		})
			.then(function (response) {
				return response.json();
			})
			.then(function (data) {
				// with the data that we get back from the req we populate a new variable object we the datavalues
				let account = JSON.parse(ls.getItem('account')); // get acc
				console.log(data); // debugging? might leave it here tho
				const pushTask = {
					// template for the task object
					id: data.taskId,
					taskDetails: {
						desc: taskContent,
						compl: 0,
					},
				};

				account.tasks.push(pushTask); // push the new task obj into the account.tasks array
				ls.setItem('account', JSON.stringify(account)); // update localstorage account
				window.location.reload(); // not exactly needed but in specific cases it can get bugged, to be discussed in the postmortem
			});
		taskInput.value = ''; // reset taskInput value
	}
});
