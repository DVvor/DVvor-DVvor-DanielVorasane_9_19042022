/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
    })
  })
  // describe("When I am on NewBill Page", () => {
    //test("Then ...", () => {
      //to-do write assertion
    //})
})


// télécharger une preuve de facture // handleChangeFile
// valider ma note de frais // 
// 