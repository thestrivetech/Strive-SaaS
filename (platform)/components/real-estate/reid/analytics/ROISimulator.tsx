'use client';

import { useState, useEffect } from 'react';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { REIDCard, REIDCardHeader, REIDCardContent } from '../shared/REIDCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

export function ROISimulator() {
  const [inputs, setInputs] = useState({
    purchasePrice: 500000,
    downPayment: 20,
    interestRate: 6.5,
    monthlyRent: 3500,
    expenses: 1500,
    appreciation: 3.5,
    holdingPeriod: 10
  });

  const [results, setResults] = useState({
    monthlyReturn: 0,
    annualReturn: 0,
    totalReturn: 0,
    cashOnCash: 0,
    capRate: 0
  });

  useEffect(() => {
    calculateROI();
  }, [inputs]);

  const calculateROI = () => {
    const downPaymentAmount = inputs.purchasePrice * (inputs.downPayment / 100);
    const loanAmount = inputs.purchasePrice - downPaymentAmount;
    const monthlyPayment = calculateMortgagePayment(loanAmount, inputs.interestRate, 30);

    const monthlyReturn = inputs.monthlyRent - monthlyPayment - inputs.expenses;
    const annualReturn = monthlyReturn * 12;
    const cashOnCash = (annualReturn / downPaymentAmount) * 100;
    const capRate = ((inputs.monthlyRent * 12 - inputs.expenses * 12) / inputs.purchasePrice) * 100;

    // Calculate total return over holding period
    const futureValue = inputs.purchasePrice * Math.pow(1 + inputs.appreciation / 100, inputs.holdingPeriod);
    const totalEquity = futureValue - loanAmount + (annualReturn * inputs.holdingPeriod);
    const totalReturn = ((totalEquity - downPaymentAmount) / downPaymentAmount) * 100;

    setResults({
      monthlyReturn,
      annualReturn,
      totalReturn,
      cashOnCash,
      capRate
    });
  };

  const calculateMortgagePayment = (principal: number, annualRate: number, years: number) => {
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1);
  };

  const updateInput = (field: string, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <REIDCard variant="purple">
      <REIDCardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">ROI Simulator</h3>
        </div>
      </REIDCardHeader>

      <REIDCardContent className="space-y-4">
        {/* Purchase Price */}
        <div className="space-y-2">
          <Label className="text-slate-300">Purchase Price</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.purchasePrice}
              onChange={(e) => updateInput('purchasePrice', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Down Payment */}
        <div className="space-y-2">
          <Label className="text-slate-300">Down Payment: {inputs.downPayment}%</Label>
          <Slider
            value={[inputs.downPayment]}
            onValueChange={(values) => updateInput('downPayment', values[0])}
            max={50}
            min={5}
            step={5}
            className="w-full"
          />
        </div>

        {/* Monthly Rent */}
        <div className="space-y-2">
          <Label className="text-slate-300">Monthly Rent</Label>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <Input
              type="number"
              value={inputs.monthlyRent}
              onChange={(e) => updateInput('monthlyRent', Number(e.target.value))}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>
        </div>

        {/* Interest Rate */}
        <div className="space-y-2">
          <Label className="text-slate-300">Interest Rate: {inputs.interestRate}%</Label>
          <Slider
            value={[inputs.interestRate]}
            onValueChange={(values) => updateInput('interestRate', values[0])}
            max={10}
            min={3}
            step={0.25}
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-slate-600 space-y-3">
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            Results
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-green-400">
                ${results.monthlyReturn.toFixed(0)}
              </div>
              <div className="text-xs text-slate-400">Monthly Cash Flow</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-cyan-400">
                {results.cashOnCash.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Cash-on-Cash</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-purple-400">
                {results.capRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-400">Cap Rate</div>
            </div>

            <div className="reid-metric p-3">
              <div className="text-lg font-bold text-yellow-400">
                {results.totalReturn.toFixed(0)}%
              </div>
              <div className="text-xs text-slate-400">{inputs.holdingPeriod}yr Return</div>
            </div>
          </div>
        </div>
      </REIDCardContent>
    </REIDCard>
  );
}
