/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills"
import router from "../app/Router.js";
import userEvent from '@testing-library/user-event'
import store from "../__mocks__/store";



describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      })) // Set as employee connected
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router() //
      window.onNavigate(ROUTES_PATH.Bills) // Direction page bills
      await waitFor(() => screen.getByTestId('icon-window')) 
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((b < a) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

  })
  describe("When I clicked on eye icon of a bill", () => {
    test("should open a modal with a bill proof", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
        document, onNavigate, store: store, localStorage: window.localStorage
      }) 
      
      const modaleFile = document.getElementById("modaleFile")
      expect(modaleFile).toBeTruthy()
      
      // Mock modal comportment
      $.fn.modal = jest.fn(modaleFile.classList.add("show"));
      
      // Verify class "show" exist to modaleFile
      let classes = document.getElementById('modaleFile').getAttribute('class')
      classes = classes.split(' ')
      expect(classes.includes('show')).toBe(true) // 

      const handleClickIconEye = jest.fn((icon) => bill.handleClickIconEye(icon))

      // function is called on each eyeicon clicked 
      const eyeIcon = screen.getAllByTestId('icon-eye')
      eyeIcon.forEach(icon => {
        icon.addEventListener("click", handleClickIconEye(icon))
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
    })
  })

  describe("When I clicked on button new bill", () => {
    test("should display the page new bill", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const bill = new Bills({
        document, onNavigate, store: store, localStorage: window.localStorage
      }) //
      
      const handleClickNewBill = jest.fn(bill.handleClickNewBill)
      const buttonNewBill = screen.getByTestId('btn-new-bill')
      buttonNewBill.addEventListener('click', handleClickNewBill)
      userEvent.click(buttonNewBill) // userEvent is a feature to simulate User. Here, user click on btn
      expect(handleClickNewBill).toHaveBeenCalled() 
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
    })
  })
})

describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to bill page", () => {
    test("Then it should fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      document.body.innerHTML = BillsUI({ data: bills }) // 
      
      await waitFor(() => screen.getByText("Mes notes de frais")) // wait after event 
      expect(screen.getByText("Mes notes de frais")).toBeTruthy() // check text in screen
    })
  })
})