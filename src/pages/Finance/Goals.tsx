import React, { useState } from 'react';
import { firestore } from './firebase';  // Import Firestore
import { Modal } from "@/components/ui/modal"; // Adjust import as needed

 // Your custom modal component

const GoalSettingModal = ({ userId, isOpen, onClose }) => {
    const [goalName, setGoalName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [goalType, setGoalType] = useState('Savings');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newGoal = {
            userId,
            name: goalName,
            goalType,
            targetAmount: parseFloat(targetAmount),
            currentAmount: 0,
            deadline: new Date(deadline),
            progress: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        try {
            // Add goal to Firestore
            await firestore.collection('goals').add(newGoal);
            alert("Goal created successfully!");
            onClose(); // Close the modal after goal is set
        } catch (error) {
            alert("Error creating goal: ", error);
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit} style={{ padding: '20px', maxWidth: '400px' }}>
                <h2>Set a Financial Goal</h2>

                <label htmlFor="goalName">Goal Name</label>
                <input
                    id="goalName"
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                    placeholder="Enter your goal name"
                    style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                />

                <label htmlFor="goalType">Goal Type</label>
                <select
                    id="goalType"
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                >
                    <option value="Savings">Savings</option>
                    <option value="Debt Repayment">Debt Repayment</option>
                    <option value="Investment">Investment</option>
                    <option value="Budget">Budget</option>
                </select>

                <label htmlFor="targetAmount">Target Amount</label>
                <input
                    id="targetAmount"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                    placeholder="Enter target amount"
                    style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                />

                <label htmlFor="deadline">Deadline</label>
                <input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    style={{ width: '100%', padding: '8px', margin: '10px 0' }}
                />

                <button type="submit" style={{ padding: '10px 20px', width: '100%', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Set Goal
                </button>
            </form>
        </Modal>
    );
};

export default GoalSettingModal;
