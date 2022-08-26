/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import { bills } from "../fixtures/bills.js"
import router from "../app/Router";
  
jest.mock("../app/store", () => mockStore)
  
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)
        router()
        window.onNavigate(ROUTES_PATH.Bills)
        
        await waitFor(() => screen.getByTestId('icon-window'))
        const windowIcon = screen.getByTestId('icon-window')
        //to-do write expect expression
        expect(windowIcon).toBeTruthy()

        const classWindowIcon = document.getElementById('layout-icon1').getAttribute('class')
        expect(classWindowIcon.includes('active-icon')).toBe(true)
      })
    test("Then bills should be ordered from earliest to latest", () => {
        document.body.innerHTML = BillsUI({ data: bills })
        const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
        const antiChrono = (a, b) => (a > b)
        const datesSorted = [...dates].sort(antiChrono)
        expect(dates).toEqual(datesSorted)
    })
  })

  describe("When I click on eye icon", () => {
    test("Then it should open a modal with a bill proof", () => {
      const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
      }
      const bill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
      }) 
      
      const modaleFile = document.getElementById("modaleFile")
      expect(modaleFile).toBeTruthy()

      // Mock modal comportment
      $.fn.modal = jest.fn(modaleFile.classList.add("show"));
      
      // Verify class "show" exist to modaleFile
      let classes = document.getElementById('modaleFile').getAttribute('class')
      classes = classes.split(' ')
      expect(classes.includes('show')).toBe(true)

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

  describe("When I click on new bill button", () => {
    test("Then it should display the page new bill", () => {
      const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
      }

      const bill = new Bills({
      document, onNavigate, store: null, localStorage: window.localStorage
      })
      
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

      document.body.innerHTML = BillsUI({ data: bills })
      
      await waitFor(() => screen.getByText("Mes notes de frais")) // wait after event 
      expect(screen.getByText("Mes notes de frais")).toBeTruthy() // check text in screen
    })
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills")
        Object.defineProperty(
            window,
            'localStorage',
            { value: localStorageMock }
        )
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee'
        }))
        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.appendChild(root)
        router()
      })
        test("Then API fetch fails with 404 error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 404"))
              }
            }})
          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 404/)
          expect(message).toBeTruthy()
        })

        test("Then API fetch fails with 500 error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              list : () =>  {
                return Promise.reject(new Error("Erreur 500"))
              }
            }})

          window.onNavigate(ROUTES_PATH.Bills)
          await new Promise(process.nextTick);
          const message = await screen.getByText(/Erreur 500/)
          expect(message).toBeTruthy()
        })
    })
  })
})