import { describe, test, expect, jest, beforeEach } from "@jest/globals"

const mockUrgent = { isApplicable: jest.fn(), calculate: jest.fn() }
const mockHigh = { isApplicable: jest.fn(), calculate: jest.fn() }
const mockMedium = { isApplicable: jest.fn(), calculate: jest.fn() }
const mockBigDescription = { isApplicable: jest.fn(), calculate: jest.fn() }
const mockDefault = { isApplicable: jest.fn(), calculate: jest.fn() }

jest.mock("../PriorityStrategy", () => ({
    UrgentPriorityStrategy: jest.fn(() => mockUrgent),
    HighPriorityStrategy: jest.fn(() => mockHigh),
    MediumPriorityStrategy: jest.fn(() => mockMedium),
    BigDescriptionPriorityStrategy: jest.fn(() => mockBigDescription),
    DefaultPriorityStrategy: jest.fn(() => mockDefault),
}))

import { PriorityCalculator } from "../PriorityCalculator"

const allStrategies = [mockUrgent, mockHigh, mockMedium, mockBigDescription, mockDefault]

describe("PriorityCalculator tests", () => {
    describe("calculate Tests", () => {
        beforeEach(() => {
            // Reseta chamadas e implementações; por padrão NENHUMA é aplicável.
            jest.clearAllMocks()
            allStrategies.forEach((strategy) => {
                strategy.isApplicable.mockReturnValue(false)
            })
        })
        test('verifica qual estratégia é aplicavel dentro da lista de estratégias privadas', () => {
            // Arrange
            const category = "qualquer category"
            const description = "qualquer description"
            mockHigh.isApplicable.mockReturnValue(true)
            // Act 
            PriorityCalculator.calculate(category, description)

            // Assert
            // esperamos que o método calculate intere por todas as strategies possíveis e verifique se 
            // o método "isApplicable" delas foi executado
            expect(mockUrgent.isApplicable).toHaveBeenCalledWith(category, description)
            
        })
    })
})