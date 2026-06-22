import { describe, test, expect } from "@jest/globals"
import { UrgentPriorityStrategy } from "../PriorityStrategy"

describe("Priority Stategies Tests", () => {
    describe("Urgent Priority Strategy Tests", () => {
        describe("isApplicable Tests", () => {
            test("retorna true quando a categoria e 'infra'", () => {
                // Arrange
                const urgentPriorityStrategy = new UrgentPriorityStrategy()
                const category = "infra"
                const description = "Qualquer descrição aqui"

                // Act
                const result = urgentPriorityStrategy.isApplicable(category, description)

                // Assert
                expect(result).toBeTruthy()
            })

            test("retorna true quando tem a palavra 'urgente' na description", () => {
                // Arrange
                const urgentPriorityStrategy = new UrgentPriorityStrategy()
                const category = "qualquer outra"
                const description = "Essa task é urgente!"

                // Act
                const result = urgentPriorityStrategy.isApplicable(category, description)

                // Assert
                expect(result).toBeTruthy()
            })

            test("retorna false se a category não for 'infra' e não tiver a palavra 'urgente' na description", () => {
                // Arrange
                const urgentPriorityStrategy = new UrgentPriorityStrategy()
                const category = "qualquer categoria aqui"
                const description = "Qualquer descrição aqui"

                // Act
                const result = urgentPriorityStrategy.isApplicable(category, description)

                // Assert
                expect(result).toBeFalsy()
            })
        })
        describe("calculate Tests", () => {
            test("sempre deve retornar 'urgent'", () => {
                // Arrange
                const urgentPriorityStrategy = new UrgentPriorityStrategy()
                const category = "qualquer categoria"
                const description = "qualquer descrição"

                // Act
                const result = urgentPriorityStrategy.calculate(category, description)

                // Assert
                expect(result).toBe("urgent")
            })
        })
    })
})