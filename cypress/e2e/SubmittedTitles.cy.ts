describe('Check Synced Titles Flow', () => {
	it('Assert Number of Villages', () => {
		cy.visit('/');
		cy.wait(1000);
		cy.get('#gpVillages').then(($value) => {
			cy.get('.villages').should('have.length', $value.text());
		});
	});

	it('Pick a random village from GP', () => {
		cy.get('.villages')
			.its('length')
			.then((n) => Cypress._.random(0, n - 1))
			.then((k) => {
				cy.log(`picked random index ${k}`);
				// get all elements again and pick one
				cy.get('.villages').eq(k).click();
			});
	});

	it('Select Submitted Titles', () => {
		cy.get('#submittedTitles').click();
	});
});
