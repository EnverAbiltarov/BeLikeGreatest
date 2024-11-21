import { Button } from "@/components/ui/button";

`
default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",`;

const Buttons = () => {
  return (
    <div className="flex flex-col gap-y-2 max-w-[300px] p-10">
      <Button variant={"default"}>123</Button>
      <Button variant={"destructive"}>123</Button>
      <Button variant={"outline"}>123</Button>
      <Button variant={"secondary"}>123</Button>
      <Button variant={"ghost"}>123</Button>
      <Button variant={"link"}>123</Button>
    </div>
  );
};

export default Buttons;
