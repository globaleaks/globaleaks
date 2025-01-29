describe("public node", () => {
  it("should load the public node and verify version", () => {
    cy.request("/api/public").as('public');

    cy.get('@public').should((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.have.property('node');
      expect(r.body.node).to.have.property('version');
      expect(r.body.node.version).to.not.be.empty;
    });
  });
});