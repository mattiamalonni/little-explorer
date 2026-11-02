import { ArrowDown, ArrowRight } from "lucide-react";
import { calculationModel, equation, type Problem } from "@/features/math/data/games";

function tensLabel(value: number) {
  return `${value} ${value === 1 ? "decina" : "decine"}`;
}

function Blocks({
  tens,
  units,
  removedTens = 0,
  removedUnits = 0,
  addedTens = 0,
  addedUnits = 0,
}: {
  tens: number;
  units: number;
  removedTens?: number;
  removedUnits?: number;
  addedTens?: number;
  addedUnits?: number;
}) {
  const removing = removedTens > 0 || removedUnits > 0;
  const description = removing
    ? `${tensLabel(tens)} e ${units} unit\u00e0. Togli ${tensLabel(removedTens)} e ${removedUnits} unit\u00e0: le parti barrate. Restano ${tensLabel(tens - removedTens)} e ${units - removedUnits} unit\u00e0.`
    : `${tensLabel(tens)} e ${units} unit\u00e0.`;
  return (
    <div className="place-value-blocks" role="img" aria-label={description}>
      <div className="place-column" aria-hidden="true">
        <span className="place-label">Decine</span>
        <div className="block-collection rods">
          {tens === 0 && <span className="empty-place">0</span>}
          {Array.from({ length: tens }, (_, i) => (
            <span
              key={i}
              className={`ten-rod ${i >= tens - removedTens ? "block-removed" : ""} ${i >= tens - addedTens ? "block-added" : ""}`}
            />
          ))}
        </div>
      </div>
      <div className="place-column" aria-hidden="true">
        <span className="place-label">Unit&agrave;</span>
        <div className="block-collection dots">
          {units === 0 && <span className="empty-place">0</span>}
          {Array.from({ length: units }, (_, i) => (
            <span
              key={i}
              className={`unit-dot ${i >= units - removedUnits ? "block-removed" : ""} ${i >= units - addedUnits ? "block-added" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Exchange({ addition }: { addition: boolean }) {
  const rod = <span className="ten-rod exchange-rod" />;
  const dots = (
    <span className="bundle-of-ten">
      {Array.from({ length: 10 }, (_, i) => (
        <span className="unit-dot" key={i} />
      ))}
    </span>
  );
  return (
    <div
      className="exchange-diagram"
      role="img"
      aria-label={addition ? "10 unit\u00e0 diventano 1 decina" : "1 decina diventa 10 unit\u00e0"}
    >
      <div aria-hidden="true">
        {addition ? dots : rod}
        <span>{addition ? "10 unit\u00e0" : "1 decina"}</span>
      </div>
      <ArrowRight aria-hidden="true" size={25} />
      <div aria-hidden="true">
        {addition ? rod : dots}
        <span>{addition ? "1 decina" : "10 unit\u00e0"}</span>
      </div>
    </div>
  );
}

export function CalculationHelp({ problem, reveal = false }: { problem: Problem; reveal?: boolean }) {
  const model = calculationModel(problem);
  return (
    <div className="calculation-guide">
      <p className="guide-intro">Segui il calcolo, un pezzetto alla volta.</p>
      <p className="blocks-key">
        <span>
          <span className="legend-rod" aria-hidden="true" /> Barretta = 10
        </span>
        <span>
          <span className="unit-dot" aria-hidden="true" /> Pallino = 1
        </span>
        {(model.adding || model.exchange) && (
          <span>
            <span className="unit-dot block-added" aria-hidden="true" /> Dorato ={" "}
            {model.adding ? "aggiunto" : "unit\u00e0 dal cambio"}
          </span>
        )}
      </p>
      <ol className="calculation-steps">
        <li>
          <h3>{model.adding ? "Metti vicini i due numeri" : `Parti da ${problem.a}`}</h3>
          <div className="operand-row">
            <strong>{problem.a}</strong>
            <Blocks tens={model.aTens} units={model.aUnits} />
          </div>
          {model.adding && (
            <div className="operand-row second-operand">
              <strong>+ {problem.b}</strong>
              <Blocks tens={model.bTens} units={model.bUnits} addedTens={model.bTens} addedUnits={model.bUnits} />
            </div>
          )}
        </li>
        {model.carry && (
          <li>
            <h3>Unisci i pallini: puoi fare una decina!</h3>
            <p>
              {model.aUnits} + {model.bUnits} = {model.aUnits + model.bUnits} unit&agrave;. Raggruppa 10 pallini e cambiali con
              una barretta.
            </p>
            <div
              className="carry-units"
              role="img"
              aria-label={`${model.aUnits + model.bUnits} unit\u00e0: un gruppo di 10 e ${model.resultUnits} unit\u00e0 fuori dal gruppo.`}
            >
              <span className="bundle-of-ten" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => (
                  <span className="unit-dot" key={i} />
                ))}
              </span>
              <span className="loose-units" aria-hidden="true">
                {Array.from({ length: model.resultUnits }, (_, i) => (
                  <span className="unit-dot" key={i} />
                ))}
              </span>
            </div>
            <Exchange addition />
            <p>La nuova barretta va insieme alle altre decine. I pallini fuori dal gruppo restano unit&agrave;.</p>
          </li>
        )}
        {model.exchange && (
          <li>
            <h3>Non bastano i pallini? Apri una decina</h3>
            <p>
              Devi togliere {model.bUnits} unit&agrave;, ma hai solo {model.aUnits} pallini. Cambia una barretta con 10 pallini:
              il valore non cambia.
            </p>
            <Exchange addition={false} />
            <div className="operand-row">
              <strong>{problem.a}</strong>
              <Blocks tens={model.workingTens} units={model.workingUnits} addedUnits={10} />
            </div>
            <p>
              Ora hai {tensLabel(model.workingTens)} e {model.workingUnits} unit&agrave;.
            </p>
          </li>
        )}
        <li>
          <h3>{model.adding ? "Riunisci le barrette e i pallini rimasti" : `Togli ${problem.b}: osserva le parti barrate`}</h3>
          {model.adding ? (
            <>
              <p>
                Unisci {tensLabel(model.aTens)} e {tensLabel(model.bTens)}
                {model.carry ? ", poi aggiungi la nuova barretta" : ""}.{" "}
                {model.carry
                  ? "Conserva i pallini rimasti fuori dal gruppo."
                  : `Unisci anche le unit\u00e0: ${model.aUnits} + ${model.bUnits}.`}
              </p>
              <Blocks
                tens={model.resultTens}
                units={model.resultUnits}
                addedTens={model.bTens + Number(model.carry)}
                addedUnits={model.carry ? 0 : model.bUnits}
              />
            </>
          ) : (
            <>
              <p>
                Togli {model.bTens} {model.bTens === 1 ? "barretta" : "barrette"} e {model.bUnits}{" "}
                {model.bUnits === 1 ? "pallino" : "pallini"}. Le parti barrate non ci sono pi&ugrave;.
              </p>
              <Blocks tens={model.workingTens} units={model.workingUnits} removedTens={model.bTens} removedUnits={model.bUnits} />
              {problem.result === 0 && <p className="zero-remainder">Hai tolto tutto: non rimane nulla.</p>}
            </>
          )}
          <div className="count-prompt">
            <ArrowDown size={19} aria-hidden="true" />
            <p>
              {reveal ? (
                <>
                  <strong>
                    {equation(problem)} = {problem.result}
                  </strong>
                  <br />
                  {tensLabel(model.resultTens)} e {model.resultUnits} unit&agrave;.
                </>
              ) : model.adding ? (
                "Ora conta: quanto valgono tutte le barrette e i pallini insieme?"
              ) : (
                "Conta solo le parti non barrate: quanto rimane?"
              )}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
