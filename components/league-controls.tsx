"use client";
import {
  Children,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type SelectHTMLAttributes,
} from "react";
import { SimpleSelect } from "@/ui/components/SimpleSelect";
import { ConfirmAlert } from "@/ui/components/ConfirmAlert";

// Adapt form values to Kitze's select while keeping the league's existing FormData contract.
export function LeagueSelect({
  children,
  name,
  value,
  defaultValue,
  onChange,
  disabled,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const [local, setLocal] = useState(String(defaultValue ?? ""));
  const id = useId();
  const options: { value: string; label: string; disabled?: boolean }[] = [];
  function collect(nodes: React.ReactNode) {
    Children.forEach(nodes, (node) => {
      if (!isValidElement(node)) return;
      const option = node as ReactElement<{
        value?: string;
        children?: React.ReactNode;
        disabled?: boolean;
      }>;
      if (option.type === "option")
        options.push({
          value: String(option.props.value ?? ""),
          label: Children.toArray(option.props.children).join(""),
          disabled: option.props.disabled,
        });
      else if (option.props.children) collect(option.props.children);
    });
  }
  collect(children);
  const selected =
    value === undefined ? local || (options[0]?.value ?? "") : String(value);
  const label =
    props["aria-label"] ??
    (name === "gameId" ? "Matchup" : name === "state" ? "Result" : "Choose an option");
  return (
    <span className="league-select">
      {name && <input type="hidden" name={name} value={selected} disabled={disabled} />}
      <SimpleSelect
        id={props.id ?? id}
        aria-label={label}
        options={options}
        value={selected}
        disabled={disabled}
        className={className}
        placeholder={options[0]?.label ?? label}
        mobileView="bottom-drawer"
        drawerTitle={label}
        withSearch={options.length > 6}
        mobileViewSearch={options.length > 6}
        onValueChange={(next) => {
          setLocal(next);
          onChange?.({
            target: { value: next, name },
            currentTarget: { value: next, name },
          } as React.ChangeEvent<HTMLSelectElement>);
        }}
      />
    </span>
  );
}
export function useConfirmation() {
  const [description, setDescription] = useState<string | null>(null);
  const resolve = useRef<((value: boolean) => void) | null>(null);
  function finish(result: boolean) {
    resolve.current?.(result);
    resolve.current = null;
    setDescription(null);
  }
  const ask = (message: string) =>
    new Promise<boolean>((done) => {
      resolve.current = done;
      setDescription(message);
    });
  const dialog = (
    <ConfirmAlert
      open={description !== null}
      onOpenChange={(open) => {
        if (!open) finish(false);
      }}
      title="Confirm your change"
      description={description ?? ""}
      onConfirm={() => finish(true)}
    />
  );
  return { ask, dialog };
}
